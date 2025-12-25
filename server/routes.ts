import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import * as XLSX from "xlsx";
import fetch from "node-fetch";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Parse Excel File
  app.post(api.parse.excel.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Simple heuristic mapping
      const questions = jsonData.map((row: any) => {
        // Try to find columns that look like "Question" or "Name" and "Link" or "URL"
        const keys = Object.keys(row);
        
        const titleKey = keys.find(k => /question|name|title|problem/i.test(k)) || keys[0];
        const linkKey = keys.find(k => /link|url|href/i.test(k)) || keys.find(k => k !== titleKey);

        return {
          title: row[titleKey] ? String(row[titleKey]) : "Untitled Question",
          link: linkKey ? String(row[linkKey]) : "",
          completed: false,
          category: "Excel Import"
        };
      });

      res.json(questions);
    } catch (error) {
      console.error('Excel parse error:', error);
      res.status(500).json({ message: "Failed to parse Excel file" });
    }
  });

  // Parse GitHub File/URL
  app.post(api.parse.github.path, async (req, res) => {
    try {
      const { url } = api.parse.github.input.parse(req.body);
      
      // Convert github UI url to raw content url if needed
      let rawUrl = url;
      if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        rawUrl = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      }

      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch GitHub file: ${response.statusText}`);
      }

      const content = await response.text();
      const questions = [];
      const lines = content.split('\n');

      // Simple markdown parsing for lists and links
      // Looks for: - [ ] [Title](link) or - [Title](link) or just [Title](link)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
      
      for (const line of lines) {
        const match = line.match(linkRegex);
        if (match) {
          questions.push({
            title: match[1],
            link: match[2],
            completed: false,
            category: "GitHub Import"
          });
        }
      }

      res.json(questions);
    } catch (error) {
      console.error('GitHub parse error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to parse GitHub content" });
    }
  });

  return httpServer;
}
