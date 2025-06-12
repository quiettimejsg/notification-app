from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, Notification, Attachment, db
from datetime import datetime

notification_bp = Blueprint('notification', __name__)

def require_admin():
    """检查当前用户是否为管理员"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': '需要管理员权限'}), 403
    return None

@notification_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """获取通知列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    priority = request.args.get('priority')
    search = request.args.get('search')
    
    query = Notification.query.filter_by(is_published=True)
    
    # 按优先级筛选
    if priority:
        query = query.filter_by(priority=priority)
    
    # 搜索功能
    if search:
        query = query.filter(
            db.or_(
                Notification.title.contains(search),
                Notification.content.contains(search)
            )
        )
    
    # 按创建时间倒序排列
    query = query.order_by(Notification.created_at.desc())
    
    # 分页
    notifications = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications.items],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@notification_bp.route('/notifications/<int:notification_id>', methods=['GET'])
def get_notification(notification_id):
    """获取单个通知详情"""
    notification = Notification.query.get_or_404(notification_id)
    
    if not notification.is_published:
        return jsonify({'message': '通知不存在'}), 404
    
    return jsonify(notification.to_dict()), 200

@notification_bp.route('/notifications', methods=['POST'])
@jwt_required()
def create_notification():
    """创建新通知（管理员）"""
    error_response = require_admin()
    if error_response:
        return error_response
    
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'message': '标题和内容不能为空'}), 400
    
    current_user_id = get_jwt_identity()
    
    notification = Notification(
        title=data.get('title'),
        content=data.get('content'),
        priority=data.get('priority', 'medium'),
        author_id=current_user_id,
        is_published=data.get('is_published', True)
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify(notification.to_dict()), 201

@notification_bp.route('/notifications/<int:notification_id>', methods=['PUT'])
@jwt_required()
def update_notification(notification_id):
    """更新通知（管理员）"""
    error_response = require_admin()
    if error_response:
        return error_response
    
    notification = Notification.query.get_or_404(notification_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'message': '请提供更新数据'}), 400
    
    # 更新字段
    if 'title' in data:
        notification.title = data['title']
    if 'content' in data:
        notification.content = data['content']
    if 'priority' in data:
        notification.priority = data['priority']
    if 'is_published' in data:
        notification.is_published = data['is_published']
    
    notification.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(notification.to_dict()), 200

@notification_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """删除通知（管理员）"""
    error_response = require_admin()
    if error_response:
        return error_response
    
    notification = Notification.query.get_or_404(notification_id)
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': '通知已删除'}), 200

@notification_bp.route('/admin/notifications', methods=['GET'])
@jwt_required()
def get_admin_notifications():
    """获取管理员通知列表（包括未发布的）"""
    error_response = require_admin()
    if error_response:
        return error_response
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    notifications = Notification.query.order_by(
        Notification.created_at.desc()
    ).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications.items],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

