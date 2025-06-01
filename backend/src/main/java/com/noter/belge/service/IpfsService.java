package com.noter.belge.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStream;
import org.json.JSONObject;

@Service
public class IpfsService {
    public String uploadToIpfs(MultipartFile file) throws IOException {
        String boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
        URL url = new URL("http://localhost:5001/api/v0/add");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        OutputStream os = conn.getOutputStream();
        String fileHeader = "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getOriginalFilename() + "\"\r\n" +
                "Content-Type: application/octet-stream\r\n\r\n";
        os.write(fileHeader.getBytes());
        os.write(file.getBytes());
        os.write(("\r\n--" + boundary + "--\r\n").getBytes());
        os.flush();
        os.close();

        InputStream is = conn.getInputStream();
        StringBuilder response = new StringBuilder();
        byte[] buffer = new byte[1024];
        int bytesRead;
        while ((bytesRead = is.read(buffer)) != -1) {
            response.append(new String(buffer, 0, bytesRead));
        }
        is.close();
        conn.disconnect();

        JSONObject json = new JSONObject(response.toString().trim().split("\n")[0]);
        return json.getString("Hash");
    }
} 