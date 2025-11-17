#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的文件上传服务器
支持图片、视频、音乐文件的上传
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from datetime import datetime
import json
import traceback
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
UPLOAD_FOLDER = {
    'images': 'images',
    'videos': 'videos',
    'music': 'music'
}
ALLOWED_EXTENSIONS = {
    'images': {'jpg', 'jpeg', 'png', 'gif', 'webp'},
    'videos': {'mp4', 'avi', 'mov', 'wmv', 'flv'},
    'music': {'mp3', 'm4a', 'wav', 'ogg', 'flac'}
}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# 数据文件路径
DATA_FILE = 'uploaded_files.json'

def load_data():
    """加载已上传文件的数据"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'images': [], 'videos': [], 'music': []}

def save_data(data):
    """保存已上传文件的数据"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def allowed_file(filename, file_type):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS[file_type]

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """上传文件接口"""
    try:
        # 检查文件类型
        file_type = request.form.get('type')  # 'image', 'video', 'music'
        if file_type not in ['image', 'video', 'music']:
            return jsonify({'error': '无效的文件类型'}), 400

        # 检查文件是否存在
        if 'file' not in request.files:
            return jsonify({'error': '没有文件'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400

        # 检查文件扩展名 - 修复键名不一致问题
        # 对于'music'类型，直接使用'music'作为键，而不是'musics'
        if not allowed_file(file.filename, file_type if file_type == 'music' else file_type + 's'):
            return jsonify({'error': '不支持的文件格式'}), 400

        # 检查文件大小
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': f'文件太大，最大允许{MAX_FILE_SIZE // 1024 // 1024}MB'}), 400

        # 获取留言
        message = request.form.get('message', '').strip()
        if file_type in ['image', 'video'] and not message:
            return jsonify({'error': '请输入留言'}), 400

        # 生成唯一文件名
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        # 修复文件夹路径查找问题
        upload_folder = UPLOAD_FOLDER[file_type if file_type == 'music' else file_type + 's']

        # 确保目录存在
        os.makedirs(upload_folder, exist_ok=True)

        # 保存文件
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)

        # 保存文件信息
        data = load_data()
        file_info = {
            'id': str(uuid.uuid4()),
            'filename': unique_filename,
            'original_name': file.filename,
            'path': file_path,
            'url': f'/{file_path}',
            'message': message or file.filename,
            'upload_time': datetime.now().isoformat(),
            'size': file_size
        }
        # 确保使用正确的键名来访问data字典
        if file_type == 'music':
            # 音乐类型使用单数形式
            data_key = 'music'
        else:
            # 其他类型使用复数形式
            data_key = file_type + 's'
        
        # 添加文件信息到正确的数据列表中
        data[data_key].append(file_info)
        save_data(data)

        return jsonify({
            'success': True,
            'message': '上传成功',
            'file': file_info
        }), 200

    except Exception as e:
        # 简化错误处理，避免JSON序列化问题
        # 打印详细错误信息到控制台以便调试
        print(f"上传错误: {type(e).__name__} - {str(e)}")
        print(traceback.format_exc())
        
        # 返回简单的错误响应给客户端
        # 不要包含复杂的对象如traceback数组，只返回必要的错误信息
        try:
            filename = request.files['file'].filename if 'file' in request.files else '未知'
        except:
            filename = '未知'
            
        return jsonify({
            'error': f'上传失败: {str(e)}',
            'exception_type': type(e).__name__,
            'uploaded_filename': filename
        }), 500

@app.route('/api/files', methods=['GET'])
def get_files():
    """获取所有已上传文件列表"""
    try:
        data = load_data()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': f'获取文件列表失败: {str(e)}'}), 500

@app.route('/api/files/<file_type>', methods=['GET'])
def get_files_by_type(file_type):
    """根据类型获取文件列表"""
    try:
        if file_type not in ['images', 'videos', 'music']:
            return jsonify({'error': '无效的文件类型'}), 400

        data = load_data()
        return jsonify(data.get(file_type, [])), 200
    except Exception as e:
        return jsonify({'error': f'获取文件列表失败: {str(e)}'}), 500

# Flask默认会提供static文件夹的静态文件
# 我们需要提供images、videos、music文件夹的访问
@app.route('/images/<path:filename>')
def serve_image(filename):
    """提供图片文件服务"""
    return send_from_directory('images', filename)

@app.route('/videos/<path:filename>')
def serve_video(filename):
    """提供视频文件服务"""
    return send_from_directory('videos', filename)

@app.route('/music/<path:filename>')
def serve_music(filename):
    """提供音乐文件服务"""
    return send_from_directory('music', filename)

@app.route('/css/<path:filename>')
def serve_css(filename):
    """提供CSS文件服务"""
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """提供JS文件服务"""
    return send_from_directory('js', filename)

@app.route('/')
def index():
    """提供主页"""
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    # 确保数据文件存在
    if not os.path.exists(DATA_FILE):
        save_data({'images': [], 'videos': [], 'music': []})

    print('服务器启动中...')
    print('访问 http://localhost:5000 查看网站')
    print('API接口:')
    print('  POST /api/upload - 上传文件')
    print('  GET  /api/files - 获取所有文件')
    print('  GET  /api/files/<type> - 获取指定类型文件')

    app.run(host='0.0.0.0', port=5000, debug=True)

