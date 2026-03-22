# Tspcvs

Ứng dụng React + Vite để quản lý sơ đồ lớp chào cờ. Dự án dùng dependency cài từ npm với phiên bản được khóa cứng trong `package.json` và `package-lock.json`, tránh phụ thuộc vào URL CDN có thể thay đổi theo thời gian.

## Chạy cục bộ

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```

## Deploy thẳng lên Netlify

Repo đã được cấu hình sẵn `netlify.toml` để build SPA từ `dist/` và rewrite mọi route về `index.html`.

```bash
npm install
npm run deploy:netlify
```

Lưu ý:
- `npm install` sẽ cài sẵn Netlify CLI vào repo, nên `npm run deploy:netlify` hoạt động ngay cả trên máy chưa cài `netlify` global.
- Lệnh trên cần bạn đăng nhập Netlify CLI hoặc cung cấp token môi trường tương ứng.
- Nếu deploy qua giao diện Netlify, chỉ cần import repo; Netlify sẽ tự dùng `npm run build` và publish thư mục `dist`.
