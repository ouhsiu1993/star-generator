FROM nginx:alpine

# 創建工作目錄
WORKDIR /usr/share/nginx/html

# 複製所有文件到容器中
COPY . .

# 設置環境變量（如果需要）
ENV NODE_ENV=production

# 暴露 80 端口
EXPOSE 80

# 啟動 nginx 服務
CMD ["nginx", "-g", "daemon off;"]