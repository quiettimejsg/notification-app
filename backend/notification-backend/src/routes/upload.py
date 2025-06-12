import os
import uuid
from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from src.models.user import User, Notification, Attachment, db

upload_bp = Blueprint('upload', __name__)

# 配置
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
    'mp3', 'wav', 'ogg', 'aac',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'rar', '7z', 'tar', 'gz'
}

def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_admin():
    """检查当前用户是否为管理员"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': '需要管理员权限'}), 403
    return None

@upload_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """上传文件"""
    error_response = require_admin()
    if error_response:
        return error_response
    
    if 'file' not in request.files:
        return jsonify({'message': '没有选择文件'}), 400
    
    file = request.files['file']
    notification_id = request.form.get('notification_id')
    
    if file.filename == '':
        return jsonify({'message': '没有选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'message': '不支持的文件类型'}), 400
    
    # 检查文件大小
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({'message': f'文件大小不能超过{MAX_FILE_SIZE // (1024*1024)}MB'}), 400
    
    # 如果指定了notification_id，检查通知是否存在
    if notification_id:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'message': '通知不存在'}), 404
    
    # 创建上传目录
    upload_dir = os.path.join(os.getcwd(), UPLOAD_FOLDER)
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成唯一文件名
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}" if file_extension else uuid.uuid4().hex
    file_path = os.path.join(upload_dir, unique_filename)
    
    # 保存文件
    file.save(file_path)
    
    # 创建附件记录
    attachment = Attachment(
        notification_id=notification_id if notification_id else None,
        filename=unique_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or 'application/octet-stream'
    )
    
    db.session.add(attachment)
    db.session.commit()
    
    return jsonify({
        'message': '文件上传成功',
        'attachment': attachment.to_dict()
    }), 201

@upload_bp.route('/files/<filename>', methods=['GET'])
def download_file(filename):
    """下载文件"""
    attachment = Attachment.query.filter_by(filename=filename).first()
    
    if not attachment:
        return jsonify({'message': '文件不存在'}), 404
    
    if not os.path.exists(attachment.file_path):
        return jsonify({'message': '文件已被删除'}), 404
    
    return send_file(
        attachment.file_path,
        as_attachment=True,
        download_name=attachment.original_filename,
        mimetype=attachment.mime_type
    )

@upload_bp.route('/attachments/<int:attachment_id>', methods=['DELETE'])
@jwt_required()
def delete_attachment(attachment_id):
    """删除附件"""
    error_response = require_admin()
    if error_response:
        return error_response
    
    attachment = Attachment.query.get_or_404(attachment_id)
    
    # 删除文件
    if os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)
    
    # 删除数据库记录
    db.session.delete(attachment)
    db.session.commit()
    
    return jsonify({'message': '附件已删除'}), 200

@upload_bp.route('/notifications/<int:notification_id>/attachments', methods=['GET'])
def get_notification_attachments(notification_id):
    """获取通知的附件列表"""
    notification = Notification.query.get_or_404(notification_id)
    
    if not notification.is_published:
        return jsonify({'message': '通知不存在'}), 404
    
    attachments = Attachment.query.filter_by(notification_id=notification_id).all()
    
    return jsonify([attachment.to_dict() for attachment in attachments]), 200

