FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install Python, pip, and LibreOffice
RUN apt-get update && apt-get install -y python3 python3-pip libreoffice

RUN python3 -m pip install --break-system-packages pdfplumber

RUN python3 -m pip install --break-system-packages openai

RUN python3 -m pip install --break-system-packages python-docx

RUN python3 -m pip install --break-system-packages PyPDF2

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]