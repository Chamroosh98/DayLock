import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import crypto from "crypto";
// @ts-ignore
import secrets from "secrets.js-grempe";

// Initialize in-memory database stores
const pastesStore = new Map<string, any>();
const e2eMessagesStore: Array<{
  id: number;
  paste_id: string;
  ciphertext: string;
  nonce: string;
  ephemeral_pub: string;
  timestamp: number;
}> = [];
let nextE2eMessageId = 1;

try {
  if (typeof secrets.init === "function") {
    // @ts-ignore
    secrets.init(8);
  }
} catch (e) {
  console.log("secrets.init call safety:", e);
}

// Cryptography Helpers
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

function encryptAESGCM(plaintext: Buffer, key: Buffer): { data: string; iv: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([tag, encrypted]);
  return {
    data: combined.toString("base64"),
    iv: iv.toString("base64")
  };
}

function decryptAESGCM(encVal: any, key: Buffer, ivVal: any): Buffer {
  const combined = Array.isArray(encVal) ? Buffer.from(encVal) : Buffer.from(String(encVal || ""), "base64");
  const iv = Array.isArray(ivVal) ? Buffer.from(ivVal) : Buffer.from(String(ivVal || ""), "base64");
  const tag = combined.subarray(0, 16);
  const encrypted = combined.subarray(16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// Steganography End-of-File Appending Helpers
const STEGO_PREFIX = "__STEGO_PAYLOAD_START__";
const STEGO_SUFFIX = "__STEGO_PAYLOAD_END__";

function hideInImageBuffer(imageBuffer: Buffer, payloadText: string): Buffer {
  const payloadStr = STEGO_PREFIX + payloadText + STEGO_SUFFIX;
  const payloadBuf = Buffer.from(payloadStr, "utf-8");
  return Buffer.concat([imageBuffer, payloadBuf]);
}

function extractFromImageBuffer(imageBuffer: Buffer): string | null {
  const imgStr = imageBuffer.toString("utf-8");
  const startIdx = imgStr.lastIndexOf(STEGO_PREFIX);
  const endIdx = imgStr.lastIndexOf(STEGO_SUFFIX);
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    return imgStr.slice(startIdx + STEGO_PREFIX.length, endIdx);
  }
  const startBuf = Buffer.from(STEGO_PREFIX);
  const endBuf = Buffer.from(STEGO_SUFFIX);
  const sIdx = imageBuffer.lastIndexOf(startBuf);
  const eIdx = imageBuffer.lastIndexOf(endBuf);
  if (sIdx !== -1 && eIdx !== -1 && sIdx < eIdx) {
    return imageBuffer.subarray(sIdx + startBuf.length, eIdx).toString("utf-8");
  }
  return null;
}

async function getCountry(req: express.Request): Promise<string> {
  const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || req.headers['x-appengine-country'];
  if (country) return country.toString().toUpperCase();
  return "US";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));

  // Shamir Split API
  app.post("/api/shamir/split", (req, res) => {
    try {
      const { secret, total, threshold } = req.body;
      if (!secret) return res.status(400).json({ error: "Missing secret string" });
      const hex = secrets.str2hex(secret);
      const shares = secrets.share(hex, total || 5, threshold || 3);
      res.json({ shares });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Shamir Combine API
  app.post("/api/shamir/combine", (req, res) => {
    try {
      const { shares } = req.body;
      if (!shares || !Array.isArray(shares) || shares.length === 0) {
        return res.status(400).json({ error: "No shares provided" });
      }
      const combinedHex = secrets.combine(shares);
      const secret = secrets.hex2str(combinedHex);
      res.json({ secret });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Stego Hide API
  app.post("/api/stego/hide", (req, res) => {
    try {
      const { image, message } = req.body; // base64 representation of PNG cover, and secret text
      if (!image || !message) {
        return res.status(400).json({ error: "Missing image base64 or message payload" });
      }
      const imageBuf = Buffer.from(image, "base64");
      const modifiedBuf = hideInImageBuffer(imageBuf, message);
      res.json({ image: modifiedBuf.toString("base64") });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Stego Extract API
  app.post("/api/stego/extract", async (req, res) => {
    try {
      let { image, url } = req.body;
      if (!image && url) {
        const fetchRes = await fetch(url);
        if (!fetchRes.ok) throw new Error("Failed to fetch image from URL");
        const arrayBuffer = await fetchRes.arrayBuffer();
        image = Buffer.from(arrayBuffer).toString("base64");
      }

      if (!image) return res.status(400).json({ error: "Missing image base64 or URL" });
      const imageBuf = Buffer.from(image, "base64");
      const extracted = extractFromImageBuffer(imageBuf);
      if (extracted === null) {
        return res.status(400).json({ error: "No hidden payload found in this file" });
      }
      res.json({ message: extracted, image: image });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Create Paste API (Encrypts on create!)
  app.post("/api/paste", (req, res) => {
    try {
      const { 
        data, password, expires_in, burn_after_read, 
        max_views, has_password, has_honey, 
        honey_data, honey_password, kind,
        original_name, mime_type, size,
        allowed_countries, dead_mans_interval,
        canary_url, unlock_at, self_destruct_hides, self_destruct_triggers,
        block_asns, allow_asns, is_e2e_channel, e2e_public_key,
        has_shamir, shamir_threshold, shamir_total,
        // Pre-encrypted variables:
        is_pre_encrypted, is_wasm_encrypted, custom_id, iv, salt: clientSalt,
        honey_iv, honey_salt: clientHoneySalt,
        has_decoy, decoy_content
      } = req.body;

      if (!data && !is_e2e_channel) return res.status(400).json({ error: "Missing payload data" });

      const id = Math.random().toString(36).substring(2, 11);
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + (expires_in || 86400);

      let finalKey: Buffer;
      let randKeyUrlB64Url = "";
      let encResult = { data: "", iv: "" };
      let finalSalt = "";

      const isPreEncrypted = Boolean(is_pre_encrypted || is_wasm_encrypted);

      if (!is_e2e_channel) {
        if (isPreEncrypted) {
          const normData = Array.isArray(data) ? Buffer.from(data).toString("base64") : (data || "");
          const normIv = Array.isArray(iv) ? Buffer.from(iv).toString("base64") : (iv || "");
          const normSalt = Array.isArray(clientSalt) ? Buffer.from(clientSalt).toString("base64") : (clientSalt || "");
          encResult = { data: normData, iv: normIv };
          finalSalt = normSalt;
        } else {
          // Standard server-side encryption
          const rawDataBuffer = (kind === "text") 
          ? Buffer.from(data || "", "utf-8") 
          : Buffer.from(data || "", "base64");

          const saltBytes = crypto.randomBytes(16);
          finalSalt = saltBytes.toString("base64");
          if (has_password) {
            finalKey = deriveKey(password || "", saltBytes);
          } else {
            // Generate random key for URL parameters
            finalKey = crypto.randomBytes(32);
            randKeyUrlB64Url = finalKey.toString("base64url");
          }

          const standardEnc = encryptAESGCM(rawDataBuffer, finalKey);
          encResult = { data: standardEnc.data, iv: standardEnc.iv };
        }
      }

      let honeyEncResult = { data: "", iv: "", salt: "" };
      if (has_honey) {
        if (is_pre_encrypted) {
          honeyEncResult = {
            data: Array.isArray(honey_data) ? Buffer.from(honey_data).toString("base64") : (honey_data || ""),
            iv: Array.isArray(honey_iv) ? Buffer.from(honey_iv).toString("base64") : (honey_iv || ""),
            salt: Array.isArray(clientHoneySalt) ? Buffer.from(clientHoneySalt).toString("base64") : (clientHoneySalt || "")
          };
        } else if (honey_data && honey_password) {
          const hSalt = crypto.randomBytes(16);
          const hKey = deriveKey(honey_password, hSalt);
          const hEnc = encryptAESGCM(Buffer.from(honey_data, "utf-8"), hKey);
          honeyEncResult = {
            data: hEnc.data,
            iv: hEnc.iv,
            salt: hSalt.toString("base64")
          };
        }
      }

      const newPaste = {
        id, 
        data: encResult.data, 
        iv: encResult.iv, 
        salt: finalSalt, 
        has_password: has_password ? 1 : 0, 
        burn_after_read: burn_after_read ? 1 : 0,
        max_views: max_views || null, 
        views: 0,
        expires_at: expiresAt, 
        has_honey: has_honey ? 1 : 0, 
        honey_data: honeyEncResult.data || null,
        honey_iv: honeyEncResult.iv || null, 
        honey_salt: honeyEncResult.salt || null, 
        kind: kind || 'text',
        original_name: original_name || null, 
        mime_type: mime_type || null, 
        size: size || (data ? data.length : 0),
        allowed_countries: allowed_countries ? JSON.stringify(allowed_countries) : null,
        dead_mans_interval: dead_mans_interval || null,
        canary_url: canary_url || null,
        unlock_at: unlock_at || null,
        last_accessed_at: now,
        self_destruct_hides: self_destruct_hides || null,
        self_destruct_triggers: self_destruct_triggers || null,
        block_asns: block_asns ? JSON.stringify(block_asns) : null,
        allow_asns: allow_asns ? JSON.stringify(allow_asns) : null,
        is_e2e_channel: is_e2e_channel ? 1 : 0,
        e2e_public_key: e2e_public_key || null,
        has_shamir: has_shamir ? 1 : 0,
        shamir_threshold: shamir_threshold || null,
        shamir_total: shamir_total || null,
        is_pre_encrypted: isPreEncrypted ? 1 : 0,
        has_decoy: has_decoy ? 1 : 0,
        decoy_content: decoy_content || null
      };
      pastesStore.set(id, newPaste);

      res.json({ id, key: is_pre_encrypted ? "" : randKeyUrlB64Url, expires_at: expiresAt });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Get Paste API (Decrypts on the fly!)
  app.get("/api/paste/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { key: queryKeyB64Url, password: queryPassword } = req.query;
      const now = Math.floor(Date.now() / 1000);

      const paste = pastesStore.get(id);

      if (!paste) {
        return res.status(404).json({ error: "Paste not found" });
      }

      // 1. Check Expiration
      if (paste.expires_at < now) {
        pastesStore.delete(id);
        return res.status(410).json({ error: "Paste expired" });
      }

      // 2. Check Time-Lock
      if (paste.unlock_at && now < paste.unlock_at) {
        return res.status(423).json({ 
          error: "Content is time-locked", 
          time_locked: true,
          data: { unlock_at: paste.unlock_at }
        });
      }

      // 3. Check Dead Man's Switch
      if (paste.dead_mans_interval && (paste.last_accessed_at + paste.dead_mans_interval < now)) {
        pastesStore.delete(id);
        return res.status(410).json({ 
          error: "Dead Man's Switch triggered", 
          dead_mans: true 
        });
      }

      // 4. Check Geo-Lock
      if (paste.allowed_countries) {
        const allowed = JSON.parse(paste.allowed_countries);
        const userCountry = await getCountry(req);
        if (!allowed.includes(userCountry)) {
          return res.status(403).json({ 
            error: "Access blocked by Geo-Lock", 
            blocked: true,
            data: { your_country: userCountry, allowed_countries: allowed }
          });
        }
      }

      // 4.1 Check ASN-Lock
      if (paste.block_asns || paste.allow_asns) {
        const userAsn = req.headers['cf-connecting-asn'] || req.headers['x-connecting-asn'] || '';
        const userAsnStr = userAsn.toString().replace(/^AS/i, '').trim();
        
        if (paste.block_asns) {
          const blocked = JSON.parse(paste.block_asns);
          if (blocked.length > 0 && blocked.includes(userAsnStr)) {
            return res.status(403).json({
              error: "Access blocked by ASN Lock",
              blocked: true,
              data: { your_asn: userAsnStr, blocked_asns: blocked }
            });
          }
        }
        
        if (paste.allow_asns) {
          const allowed = JSON.parse(paste.allow_asns);
          if (allowed.length > 0 && !allowed.includes(userAsnStr)) {
            return res.status(403).json({
              error: "Access blocked by ASN Lock",
              blocked: true,
              data: { your_asn: userAsnStr, allowed_asns: allowed }
            });
          }
        }
      }

      // 4.2 Check E2E Channel
      if (paste.is_e2e_channel) {
        const messages = e2eMessagesStore
          .filter(m => m.paste_id === id)
          .sort((a, b) => a.timestamp - b.timestamp);
        return res.json({
          id: paste.id,
          is_e2e_channel: true,
          e2e_public_key: paste.e2e_public_key,
          e2e_messages: messages,
          expires_at: paste.expires_at,
          views: paste.views
        });
      }

      // 5. Trigger Canary Token (Async)
      if (paste.canary_url) {
        fetch(paste.canary_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'paste_accessed',
            id: paste.id,
            timestamp: now,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            user_agent: req.headers['user-agent']
          })
        }).catch(err => console.error("Canary trigger failed", err));
      }

      // Check if password lock and no query payload
      if (paste.is_pre_encrypted === 1 || paste.is_pre_encrypted === true) {
        paste.views = (paste.views || 0) + 1;
        paste.last_accessed_at = now;
        const viewsUpdated = { views: paste.views };

        const responsePayload = {
          id: paste.id,
          is_pre_encrypted: true,
          has_password: paste.has_password === 1 || paste.has_password === true,
          has_shamir: paste.has_shamir === 1 || paste.has_shamir === true,
          shamir_threshold: paste.shamir_threshold,
          shamir_total: paste.shamir_total,
          kind: paste.kind,
          size: paste.size,
          expires_at: paste.expires_at,
          max_views: paste.max_views,
          views: viewsUpdated.views,
          self_destruct_hides: paste.self_destruct_hides,
          self_destruct_triggers: paste.self_destruct_triggers,
          data: paste.data,
          iv: paste.iv,
          salt: paste.salt,
          has_honey: paste.has_honey === 1 || paste.has_honey === true,
          honey_data: paste.honey_data,
          honey_iv: paste.honey_iv,
          honey_salt: paste.honey_salt
        };

        if (paste.burn_after_read === 1 || (paste.max_views && responsePayload.views >= paste.max_views)) {
          pastesStore.delete(id);
          for (let i = e2eMessagesStore.length - 1; i >= 0; i--) {
            if (e2eMessagesStore[i].paste_id === id) {
              e2eMessagesStore.splice(i, 1);
            }
          }
        }

        return res.json(responsePayload);
      }

      if (paste.has_password && !queryPassword) {
        return res.json({
          id: paste.id,
          has_password: true,
          has_shamir: paste.has_shamir === 1 || paste.has_shamir === true,
          shamir_threshold: paste.shamir_threshold,
          shamir_total: paste.shamir_total,
          kind: paste.kind,
          size: paste.size,
          expires_at: paste.expires_at,
          max_views: paste.max_views,
          views: paste.views,
          self_destruct_hides: paste.self_destruct_hides,
          self_destruct_triggers: paste.self_destruct_triggers
        });
      }

      let decryptedBuffer: Buffer;
      let isHoney = false;

      try {
        if (paste.has_password) {
          const userPwd = String(queryPassword || "");
          const saltBuf = Buffer.from(paste.salt, "base64");

          // Test Decoy first
          if (paste.has_honey && paste.honey_data) {
            try {
              const hSaltBuf = Buffer.from(paste.honey_salt, "base64");
              const hKey = deriveKey(userPwd, hSaltBuf);
              decryptedBuffer = decryptAESGCM(paste.honey_data, hKey, paste.honey_iv);
              isHoney = true;
            } catch (e) {
              // Try real password
              const realKey = deriveKey(userPwd, saltBuf);
              decryptedBuffer = decryptAESGCM(paste.data, realKey, paste.iv);
            }
          } else {
            const realKey = deriveKey(userPwd, saltBuf);
            decryptedBuffer = decryptAESGCM(paste.data, realKey, paste.iv);
          }
        } else {
          // Non-password paste uses URL-safe base64 key
          if (!queryKeyB64Url) {
            return res.status(400).json({ error: "Missing decryption key" });
          }
          const realKey = Buffer.from(String(queryKeyB64Url), "base64url");
          decryptedBuffer = decryptAESGCM(paste.data, realKey, paste.iv);
        }
      } catch (cryptoErr) {
        return res.status(401).json({ error: "Invalid credentials or corrupted payload" });
      }

      // Update views and last_accessed_at in the background
      paste.views = (paste.views || 0) + 1;
      paste.last_accessed_at = now;
      const viewsUpdated = { views: paste.views };

      // Format payload content to return
      let dataOut = "";
      if (isHoney) {
        dataOut = decryptedBuffer.toString("utf-8"); // honey is always text
      } else if (paste.kind === "text") {
        dataOut = decryptedBuffer.toString("utf-8");
      } else {
        dataOut = decryptedBuffer.toString("base64");
      }

      const responsePayload = {
        id: paste.id,
        kind: isHoney ? "text" : paste.kind,
        data: dataOut,
        is_honey: isHoney,
        original_name: isHoney ? null : paste.original_name,
        mime_type: isHoney ? "text/plain" : paste.mime_type,
        size: decryptedBuffer.length,
        burn_after_read: paste.burn_after_read,
        expires_at: paste.expires_at,
        max_views: paste.max_views,
        views: viewsUpdated ? viewsUpdated.views : paste.views + 1,
        self_destruct_hides: paste.self_destruct_hides,
        self_destruct_triggers: paste.self_destruct_triggers
      };

      // Burn after read or max views reached
      if (paste.burn_after_read === 1 || (paste.max_views && responsePayload.views >= paste.max_views)) {
        pastesStore.delete(id);
        for (let i = e2eMessagesStore.length - 1; i >= 0; i--) {
          if (e2eMessagesStore[i].paste_id === id) {
            e2eMessagesStore.splice(i, 1);
          }
        }
      }

      res.json(responsePayload);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/paste/:id", (req, res) => {
    const { id } = req.params;
    pastesStore.delete(id);
    for (let i = e2eMessagesStore.length - 1; i >= 0; i--) {
      if (e2eMessagesStore[i].paste_id === id) {
        e2eMessagesStore.splice(i, 1);
      }
    }
    res.json({ success: true });
  });

  // Post E2E message to a channel
  app.post("/api/paste/:id/e2e", (req, res) => {
    try {
      const { id } = req.params;
      const { e2e_message } = req.body;
      if (!e2e_message) {
        return res.status(400).json({ error: "Missing e2e_message body" });
      }
      const { ciphertext, nonce, ephemeral_pub, timestamp } = e2e_message;
      if (!ciphertext || !nonce || !ephemeral_pub) {
        return res.status(400).json({ error: "Missing required e2e_message fields" });
      }

      // Verify paste/channel exists
      const paste = pastesStore.get(id);
      if (!paste) {
        return res.status(404).json({ error: "E2E Channel not found" });
      }

      const msg = {
        id: nextE2eMessageId++,
        paste_id: id,
        ciphertext,
        nonce,
        ephemeral_pub,
        timestamp: timestamp || Math.floor(Date.now() / 1000)
      };
      e2eMessagesStore.push(msg);

      res.json({ ok: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Client info helper for Geo-Lock
  app.get("/api/myinfo", async (req, res) => {
    try {
      const country = await getCountry(req);
      const asn = req.headers['cf-connecting-asn'] || req.headers['x-connecting-asn'] || '12880';
      res.json({ country, asn: asn.toString().replace(/^AS/i, '').trim() });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Compatibility routes
  app.post("/api/file", (req, res) => {
    req.url = "/api/paste";
    app._router.handle(req, res, () => {});
  });

  app.get("/api/file/:id", (req, res) => {
    req.url = `/api/paste/${req.params.id}`;
    app._router.handle(req, res, () => {});
  });

  // Serve WASM pkg directory statically at /pkg
  const pkgDir = path.join(process.cwd(), "backend/worker/pkg");
  app.use("/pkg", express.static(pkgDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
