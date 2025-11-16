# 服务器部署说明

## 功能说明

现在网站支持真正的服务器端文件上传功能！任何人都可以上传文件到服务器，所有用户都能看到。

## 部署步骤

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 修改API地址

在 `js/app.js` 文件中，找到这一行：
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

将其修改为你的服务器地址，例如：
```javascript
const API_BASE_URL = 'http://your-domain.com/api';
// 或者
const API_BASE_URL = 'http://your-ip:5000/api';
```

### 3. 启动服务器

```bash
python server.py
```

服务器将在 `http://0.0.0.0:5000` 启动

### 4. 访问网站

- 本地访问：`http://localhost:5000`
- 局域网访问：`http://你的IP:5000`
- 公网访问：`http://你的域名:5000`

## 功能特点

1. **文件上传**：
   - 支持图片、视频、音乐文件上传
   - 图片和视频需要输入留言（作为标题）
   - 显示上传进度条
   - 文件大小限制：100MB

2. **文件存储**：
   - 文件保存在服务器的 `images/`、`videos/`、`music/` 文件夹
   - 文件信息保存在 `uploaded_files.json`

3. **文件共享**：
   - 所有用户上传的文件都会显示在网站上
   - 刷新页面后自动加载最新文件

## API接口

- `POST /api/upload` - 上传文件
  - 参数：`file`（文件）、`type`（类型：image/video/music）、`message`（留言）
  
- `GET /api/files` - 获取所有文件列表

- `GET /api/files/<type>` - 获取指定类型文件（images/videos/music）

## 安全建议

1. **生产环境部署**：
   - 使用 Nginx 作为反向代理
   - 配置 HTTPS
   - 添加文件大小和类型限制
   - 添加身份验证（可选）

2. **文件管理**：
   - 定期清理不需要的文件
   - 监控磁盘空间使用

3. **备份**：
   - 定期备份 `uploaded_files.json` 和文件文件夹

## 注意事项

- 确保服务器有足够的磁盘空间
- 建议设置文件大小限制（已在代码中设置为100MB）
- 如果服务器无法访问，网站会回退到使用本地文件

