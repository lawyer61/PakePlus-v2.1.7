window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});
const { invoke } = window.__TAURI__.core;

const GOTIFY_URL = "https://gotify.11091997.xyz";
const GOTIFY_TOKEN = "AyqULs36vIabTiB";
const GOTIFY_TITLE = "未找到书架";
const GOTIFY_MESSAGE = "脚本在首页未找到'我的书架'元素，已终止。";

const START_HOUR = 0;
const END_HOUR = 23;
const MAX_DURATION_MS = 60 * 60 * 1000; // 1 hour

const scriptStartTime = Date.now();

function sendNotification(title, message) {
    const command = `curl "${GOTIFY_URL}/message?token=${GOTIFY_TOKEN}" -F "title=${title}" -F "message=${message}"`;
    invoke('run_command', { command });
    console.log("发送通知:", title);
}

function clickElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.click();
        return true;
    }
    return false;
}

function findElementByText(tag, text) {
    return Array.from(document.querySelectorAll(tag)).find(el => el.textContent.trim() === text);
}

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

function main() {
    // 1. Check time
    const currentHour = new Date().getHours();
    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
        console.log("不在指定时间段内，脚本退出。");
        return;
    }

    // 4. Check runtime duration
    if (Date.now() - scriptStartTime > MAX_DURATION_MS) {
        console.log("脚本运行超过1小时，退出。");
        if (clickElement('a.readerTopBar_link:nth-child(1)')) {
            console.log("已点击返回首页。");
        }
        return;
    }

    // 2. Check if on book page
    if (document.querySelector('a.readerTopBar_link:nth-child(1)')) {
        console.log("在书籍页面，返回首页。");
        clickElement('a.readerTopBar_link:nth-child(1)');
        // Wait a bit for the page to navigate
        setTimeout(checkHomePage, 2000);
        return;
    }

    checkHomePage();
}

function checkHomePage() {
     // 2.1 Find "我的书架"
    const bookshelfElement = findElementByText('div', '我的书架');

    if (!bookshelfElement) {
        console.log("未找到'我的书架'，发送通知并终止。");
        sendNotification(GOTIFY_TITLE, GOTIFY_MESSAGE);
        return;
    }

    // 2.2 Click on the first book
    console.log("找到'我的书架'，打开第一本书。");
    if (clickElement('a.wr_suggestion_card_wrapper:nth-child(1)')) {
        // Wait for the book to open
        setTimeout(readBook, 5000);
    } else {
        console.log("未找到第一本书。");
    }
}


function readBook() {
    console.log("开始阅读书籍，每10秒滚动一次。");

    const scrollInterval = setInterval(() => {
        // 4. Check runtime duration again inside interval
        if (Date.now() - scriptStartTime > MAX_DURATION_MS) {
            console.log("脚本运行超过1小时，停止阅读并退出。");
            clearInterval(scrollInterval);
            if (clickElement('a.readerTopBar_link:nth-child(1)')) {
                console.log("已点击返回首页。");
            }
            return;
        }

        // 3. Scroll and check for footer
        const footerButton = document.querySelector('.readerFooter_button');
        if (footerButton) {
            console.log("到达页面底部，点击页脚按钮。");
            footerButton.click();
            clearInterval(scrollInterval);
             // Go back to the main loop after a delay
            setTimeout(main, 2000);
        } else {
            console.log("向下滚动...");
            scrollToBottom();
        }
    }, 10000); // 10 seconds
}

// Start the script
console.log("启动微信读书自动化脚本。");
main();
