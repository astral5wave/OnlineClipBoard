# OCB - Online Clipboard  

OCB is a simple online clipboard that lets you temporarily store and access text from anywhere. This project was my first attempt at using **Go (Golang)**, and I built it just as a hobby to explore backend development.  

## Why I Made This?  
I wanted a quick way to copy-paste text across devices without signing up or using third-party services. It was also a great opportunity to try **Go** and learn how to work with a **Redis-based key-value store** for temporary data storage.  

## 🛠 Tech Stack  
- **Frontend:** React (Wails)  
- **Backend:** Go (Golang)  
- **Database:** Redis (Upstash)  

## 🔹 How It Works?  
1. Users can paste text, which gets stored temporarily.  
2. A unique key is generated for access.  
3. Data automatically expires after **10 minutes**.

## ⚠️ Important Note
This backend runs on **Render's free tier**, which may **go to sleep after inactivity**.  
**If accessing after a long time, the first request may take 30 sec ~ 1 min for server to wake up. So please have patience!**

---

✉️ Just a fun little project to explore **Go**! Let me know if you have feedback. 
