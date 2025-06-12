import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from src.models.user import db, User
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.notification import notification_bp
from src.routes.upload import upload_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# 配置
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # 不过期
app.config['JWT_CSRF_METHODS'] = []  # 完全禁用CSRF保护
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notification_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)
CORS(app, origins="*")  # 允许所有来源的跨域请求

# 注册蓝图
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(notification_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

# JWT错误处理
# @jwt.token_in_blocklist_loader
# def check_if_token_revoked(jwt_header, jwt_payload):
#     from src.routes.auth import blacklisted_tokens
#     jti = jwt_payload['jti']
#     return jti in blacklisted_tokens

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return {'message': 'Token已被撤销'}, 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {'message': 'Token已过期'}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {'message': 'Token无效'}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {'message': '需要提供访问令牌'}, 401

# 创建数据库表和默认管理员用户
with app.app_context():
    db.create_all()
    
    # 检查是否存在管理员用户，如果不存在则创建默认管理员
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(username='admin', is_admin=True)
        admin_user.set_password('admin123')  # 默认密码，生产环境应该修改
        db.session.add(admin_user)
        db.session.commit()
        print("创建默认管理员用户: admin / admin123")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

