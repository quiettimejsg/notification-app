#!/bin/bash

# 通知管理系统部署脚本
# 使用方法: ./deploy.sh [development|production]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查环境
check_environment() {
    print_step "检查环境依赖..."
    
    check_command "python3"
    check_command "node"
    check_command "pnpm"
    
    print_message "环境检查通过"
}

# 部署后端
deploy_backend() {
    print_step "部署后端服务..."
    
    cd backend/notification-backend
    
    # 创建虚拟环境（如果不存在）
    if [ ! -d "venv" ]; then
        print_message "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    print_message "安装Python依赖..."
    pip install -r requirements.txt
    
    # 初始化数据库
    print_message "初始化数据库..."
    python -c "
from src.main import app, db
with app.app_context():
    db.create_all()
    print('数据库初始化完成')
"
    
    if [ "$1" = "production" ]; then
        # 生产环境启动
        print_message "启动生产环境后端服务..."
        gunicorn -w 4 -b 0.0.0.0:5001 src.main:app --daemon
    else
        # 开发环境启动
        print_message "启动开发环境后端服务..."
        python src/main.py &
    fi
    
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    cd ../..
    print_message "后端服务启动完成 (PID: $BACKEND_PID)"
}

# 部署前端
deploy_frontend() {
    print_step "部署前端应用..."
    
    cd frontend/notification-frontend
    
    # 安装依赖
    print_message "安装前端依赖..."
    pnpm install
    
    if [ "$1" = "production" ]; then
        # 生产环境构建
        print_message "构建生产版本..."
        pnpm run build
        
        # 启动静态文件服务器
        print_message "启动静态文件服务器..."
        npx serve -s dist -l 3000 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > frontend.pid
        print_message "前端应用启动完成 (PID: $FRONTEND_PID)"
        print_message "访问地址: http://localhost:3000"
    else
        # 开发环境启动
        print_message "启动开发服务器..."
        pnpm run dev --host &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > frontend.pid
        print_message "前端开发服务器启动完成 (PID: $FRONTEND_PID)"
        print_message "访问地址: http://localhost:5174"
    fi
    
    cd ../..
}

# 停止服务
stop_services() {
    print_step "停止所有服务..."
    
    # 停止后端
    if [ -f "backend/notification-backend/backend.pid" ]; then
        BACKEND_PID=$(cat backend/notification-backend/backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            kill $BACKEND_PID
            print_message "后端服务已停止"
        fi
        rm backend/notification-backend/backend.pid
    fi
    
    # 停止前端
    if [ -f "frontend/notification-frontend/frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend/notification-frontend/frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null; then
            kill $FRONTEND_PID
            print_message "前端服务已停止"
        fi
        rm frontend/notification-frontend/frontend.pid
    fi
    
    # 清理其他可能的进程
    pkill -f "python src/main.py" 2>/dev/null || true
    pkill -f "vite --host" 2>/dev/null || true
    pkill -f "serve -s dist" 2>/dev/null || true
}

# 显示状态
show_status() {
    print_step "服务状态检查..."
    
    # 检查后端
    if curl -s http://localhost:5001/api/auth/me > /dev/null 2>&1; then
        print_message "后端服务: 运行中 (http://localhost:5001)"
    else
        print_warning "后端服务: 未运行"
    fi
    
    # 检查前端
    if curl -s http://localhost:5174 > /dev/null 2>&1; then
        print_message "前端服务: 运行中 (http://localhost:5174)"
    elif curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_message "前端服务: 运行中 (http://localhost:3000)"
    else
        print_warning "前端服务: 未运行"
    fi
}

# 显示帮助信息
show_help() {
    echo "通知管理系统部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令] [环境]"
    echo ""
    echo "命令:"
    echo "  start [development|production]  启动服务 (默认: development)"
    echo "  stop                           停止所有服务"
    echo "  restart [development|production] 重启服务"
    echo "  status                         显示服务状态"
    echo "  help                           显示帮助信息"
    echo ""
    echo "环境:"
    echo "  development                    开发环境 (默认)"
    echo "  production                     生产环境"
    echo ""
    echo "示例:"
    echo "  $0 start                       启动开发环境"
    echo "  $0 start production            启动生产环境"
    echo "  $0 stop                        停止所有服务"
    echo "  $0 restart development         重启开发环境"
    echo "  $0 status                      查看服务状态"
}

# 主函数
main() {
    local command=${1:-start}
    local environment=${2:-development}
    
    case $command in
        "start")
            print_message "启动通知管理系统 ($environment 环境)..."
            check_environment
            deploy_backend $environment
            sleep 3  # 等待后端启动
            deploy_frontend $environment
            sleep 2  # 等待前端启动
            show_status
            print_message "部署完成！"
            
            if [ "$environment" = "development" ]; then
                print_message "默认管理员账号: admin / admin123"
                print_message "前端地址: http://localhost:5174"
                print_message "后端地址: http://localhost:5001"
            else
                print_message "默认管理员账号: admin / admin123"
                print_message "前端地址: http://localhost:3000"
                print_message "后端地址: http://localhost:5001"
            fi
            ;;
        "stop")
            stop_services
            print_message "所有服务已停止"
            ;;
        "restart")
            print_message "重启通知管理系统 ($environment 环境)..."
            stop_services
            sleep 2
            check_environment
            deploy_backend $environment
            sleep 3
            deploy_frontend $environment
            sleep 2
            show_status
            print_message "重启完成！"
            ;;
        "status")
            show_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
main "$@"

