// 全局变量
let currentAudio = null;
let currentMusicIndex = 0;
let activeDanmus = [];
let particles = [];
let danmuAnimationIds = [];
let particleAnimationIds = [];
let currentSlide = 0;
let uploadType = ''; // 'video', 'image', 'music'
// 服务器API地址 - 如果使用HTTPS，请确保API也使用HTTPS
const API_BASE_URL =  'http://localhost:5001/api';

// 数据定义
const imageList = [
    {url: "images/1.jpg", alt: "宝宝养的含羞草，好喜欢"},
    {url: "images/2.jpg", alt: "为宝宝点赞！！"},
    {url: "images/3.jpg", alt: "楠楠送给我的鲜花"},
    {url: "images/4.jpg", alt: "守护着天空、大海和你"},
    {url: "images/5.jpg", alt: "和宝宝手一样大的蘑菇 ps：但是被宝宝拔喽，坏宝宝"},
    {url: "images/6.jpg", alt: "宝宝的手手不能要了"},
    {url: "images/7.jpg", alt: "宝宝送给我的狗狗，好喜欢晚上抱在怀里！"},
    {url: "images/8.jpg", alt: "那一天，我们相遇了"},
    {url: "images/9.jpg", alt: "我宣泥，楠楠宝宝！"},
    {url: "images/10.jpg", alt: "520025，1314在一起ヽ(￣ω￣(￣ω￣〃)ゝ"},
    {url: "images/11.png", alt: "围着池塘种了一圈树"}
];

// 视频数据 - 可以继续添加新视频
const videoList = [
    {
        url: "videos/10月1日.mp4",
        title: "问题小楠",
        thumbnail: "images/v_2.png" // 视频封面图
    },
    {
        url: "videos/1.mp4",
        title: "9月",
        thumbnail: "images/v_1.jpg" // 视频封面图
    }
    // 继续添加格式：
    // { url: "视频链接", title: "视频标题", thumbnail: "封面图链接" },
];

const musicFiles = [
    {name: "歌曲1", path: "music/song1.m4a"},
    {name: "歌曲2", path: "music/song2.m4a"},
    {name: "歌曲3", path: "music/song3.m4a"},
    {name: "歌曲4", path: "music/song4.m4a"},
    {name: "歌曲5", path: "music/song5.m4a"},
    {name:'歌曲6><',path:"music/song6.m4a"},
    {name: "歌曲7", path: "music/song7.m4a"},
    {name: "歌曲8", path: "music/song8.m4a"},
    {name: "歌曲9", path: "music/song9.m4a"},
    {name: "歌曲10", path: "music/song10.m4a"},
];

const danmuTexts = [
    "喜欢小浣浣❤️❤️❤️❤️",
    "吃了没？今天也要开心呀🥰🥰",
    "可以一直陪着我吗つ♡⊂",
    "喜欢你",
    "🥰🥰🥰想永远在一起",
    "爱你是如此自然，像呼吸，像心跳",
    "不管今天发生什么，只要和你说说话，坏心情就全跑光啦✨",
    "想你的每一天🥺🥺🥺🥺🥺"
];

// 页面加载完成后初始化
window.addEventListener('load', () => {
    // 隐藏加载动画
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 800);

    // 初始化所有功能
    initLoveTimer();
    initDanmuSystem();
    createParticles();
    initThemeToggle();
    preloadImages();
    
    // 初始化上传系统
    initUploadSystem();
    
    // 从服务器加载文件
    loadFilesFromServer().then(() => {
        renderMusicList();
        initImageGallery();
        initVideoGallery();
    });
});

// 相恋计时器
function initLoveTimer() {
    // 请替换为实际相恋日期
    const loveDate = new Date('2025-09-16');

    function updateTimer() {
        const now = new Date();
        const diff = now - loveDate;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('timerValue').textContent =
            `${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// 图片画廊
// 图片画廊（带上方描述文本）
function initImageGallery() {
    const imageGallery = document.getElementById('imageGallery');
    const galleryContainer = document.getElementById('galleryContainer');
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');
    const imageZoomLayer = document.getElementById('imageZoomLayer');
    const zoomedImage = document.getElementById('zoomedImage');
    const closeZoomBtn = document.getElementById('closeZoomBtn');
    const imageCaption = document.getElementById('imageCaption');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    const imageBtn = document.getElementById('imageBtn');

    // 清空容器（避免重复渲染）
    galleryContainer.innerHTML = '';

    // 渲染图片列表（带描述文本）
    imageList.forEach((img, index) => {
        // 图片容器（用于包裹图片、描述、索引）
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.paddingTop = '30px'; // 给上方描述留空间
        imgContainer.style.transition = 'transform 0.3s ease';

        // 图片描述文本（显示在图片上方）
        const imgDesc = document.createElement('div');
        imgDesc.style.position = 'absolute';
        imgDesc.style.top = '5px';
        imgDesc.style.left = '50%';
        imgDesc.style.transform = 'translateX(-50%)';
        imgDesc.style.color = 'var(--text-white)';
        imgDesc.style.fontSize = '12px';
        imgDesc.style.textAlign = 'center';
        imgDesc.style.width = '90%';
        imgDesc.style.whiteSpace = 'nowrap';
        imgDesc.style.overflow = 'hidden';
        imgDesc.style.textOverflow = 'ellipsis';
        imgDesc.style.textShadow = '0 0 3px rgba(0,0,0,0.7)';
        imgDesc.textContent = img.alt; // 显示图片的alt描述

        // 图片元素
        const imgElement = document.createElement('img');
        imgElement.src = img.url;
        imgElement.alt = img.alt;
        imgElement.className = 'galleryImage';
        imgElement.style.filter = 'blur(2px)'; // 加载前模糊效果
        imgElement.onload = () => {
            imgElement.style.filter = 'none'; // 加载完成后清晰
        };

        // 索引标记（右上角）
        const indexBadge = document.createElement('div');
        indexBadge.style.position = 'absolute';
        indexBadge.style.top = '5px';
        indexBadge.style.right = '5px';
        indexBadge.style.backgroundColor = 'rgba(0,0,0,0.5)';
        indexBadge.style.color = 'white';
        indexBadge.style.borderRadius = '50%';
        indexBadge.style.width = '18px';
        indexBadge.style.height = '18px';
        indexBadge.style.display = 'flex';
        indexBadge.style.alignItems = 'center';
        indexBadge.style.justifyContent = 'center';
        indexBadge.style.fontSize = '12px';
        indexBadge.textContent = index + 1;

        // 图片点击放大
        imgElement.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            imageZoomLayer.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // 容器hover效果
        imgContainer.addEventListener('mouseenter', () => {
            imgContainer.style.transform = 'translateY(-5px)';
        });
        imgContainer.addEventListener('mouseleave', () => {
            imgContainer.style.transform = 'translateY(0)';
        });

        // 组装元素（顺序：描述 → 图片 → 索引）
        imgContainer.appendChild(imgDesc);
        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(indexBadge);
        galleryContainer.appendChild(imgContainer);
    });

    // 显示指定幻灯片
    function showSlide(index) {
        const image = imageList[index];
        zoomedImage.src = image.url;
        imageCaption.textContent = image.alt;
        currentSlide = index;
    }

    // 事件监听（保持原有功能不变）
    imageBtn.addEventListener('click', () => {
        imageGallery.classList.toggle('active');
        if (imageGallery.classList.contains('active')) {
            galleryContainer.scrollTop = 0;
        }
    });

    closeGalleryBtn.addEventListener('click', () => {
        imageGallery.classList.remove('active');
    });

    closeZoomBtn.addEventListener('click', () => {
        imageZoomLayer.classList.remove('active');
        document.body.style.overflow = '';
    });

    // 图片导航
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSlide = (currentSlide - 1 + imageList.length) % imageList.length;
        showSlide(currentSlide);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSlide = (currentSlide + 1) % imageList.length;
        showSlide(currentSlide);
    });

    // 点击空白处关闭
    imageZoomLayer.addEventListener('click', (e) => {
        if (e.target === imageZoomLayer) {
            imageZoomLayer.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!imageZoomLayer.classList.contains('active')) return;

        if (e.key === 'Escape') {
            imageZoomLayer.classList.remove('active');
            document.body.style.overflow = '';
        } else if (e.key === 'ArrowLeft') {
            currentSlide = (currentSlide - 1 + imageList.length) % imageList.length;
            showSlide(currentSlide);
        } else if (e.key === 'ArrowRight') {
            currentSlide = (currentSlide + 1) % imageList.length;
            showSlide(currentSlide);
        }
    });
}

// 视频画廊
function initVideoGallery() {
    const videoBtn = document.getElementById('videoBtn');
    const videoGallery = document.getElementById('videoGallery');
    const videoContainer = document.getElementById('videoContainer');
    const closeVideoBtn = document.getElementById('closeVideoBtn');

    // 创建视频播放层
    const videoOverlay = document.createElement('div');
    videoOverlay.id = 'videoOverlay';
    videoOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        z-index: 300;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    videoOverlay.innerHTML = `
        <video id="videoPlayer" controls style="max-width: 90%; max-height: 80vh;"></video>
        <button id="closeVideoPlayer" class="btn" style="position: absolute; top: 20px; right: 20px;">
            关闭视频
        </button>
    `;
    document.body.appendChild(videoOverlay);

    // 渲染视频列表
    videoList.forEach((video) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'videoItem';
        videoItem.innerHTML = `
            <div class="videoTitle">${video.title}</div>
            <div class="videoThumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover">
                <div class="videoPlayIcon"></div>
            </div>
        `;
        videoItem.addEventListener('click', () => {
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.src = video.url;
            videoPlayer.play();
            videoOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        videoContainer.appendChild(videoItem);
    });

    // 事件监听
    videoBtn.addEventListener('click', () => {
        videoGallery.classList.toggle('active');
    });

    closeVideoBtn.addEventListener('click', () => {
        videoGallery.classList.remove('active');
    });

    document.getElementById('closeVideoPlayer').addEventListener('click', () => {
        document.getElementById('videoPlayer').pause();
        videoOverlay.style.display = 'none';
        document.body.style.overflow = '';
    });

    videoOverlay.addEventListener('click', (e) => {
        if (e.target === videoOverlay) {
            document.getElementById('videoPlayer').pause();
            videoOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// 音乐功能
function renderMusicList() {
    const musicBtn = document.getElementById('musicBtn');
    const musicList = document.getElementById('musicList');
    const audioControl = document.getElementById('audioControl');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentMusicName = document.getElementById('currentMusicName');

    // 渲染音乐列表
    musicFiles.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'musicItem';
        musicItem.textContent = music.name;
        musicItem.addEventListener('click', () => {
            playMusic(index);
        });
        musicList.appendChild(musicItem);
    });

    // 播放音乐
    let endedHandler = null;
    let errorHandler = null;
    
    function playMusic(index) {
        if (currentAudio) {
            currentAudio.pause();
            if (endedHandler) {
                currentAudio.removeEventListener('ended', endedHandler);
            }
            if (errorHandler) {
                currentAudio.removeEventListener('error', errorHandler);
            }
            currentAudio = null;
        }

        currentMusicIndex = index;
        const music = musicFiles[index];
        
        // 使用原始路径（相对于 HTML 文件）
        const audioPath = music.path;
        
        // 先检查文件是否存在
        fetch(audioPath, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`文件不存在 (${response.status})`);
                }
                return response;
            })
            .then(() => {
                // 文件存在，创建音频对象
                currentAudio = new Audio(audioPath);
                
                // 设置音频属性
                currentAudio.volume = 1.0; // 确保音量是100%
                currentAudio.preload = 'auto';
                
                // 监听音频可以播放事件
                currentAudio.addEventListener('canplay', () => {
                    console.log('音频已加载，可以播放:', music.name);
                });
                
                // 监听音乐结束事件
                endedHandler = () => {
                    currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
                    playMusic(currentMusicIndex);
                };
                currentAudio.addEventListener('ended', endedHandler);
                
                // 监听错误事件（更详细的错误信息）
                errorHandler = (e) => {
                    console.error('音频播放错误:', e);
                    console.error('音频路径:', audioPath);
                    console.error('音频对象状态:', {
                        networkState: currentAudio.networkState,
                        readyState: currentAudio.readyState,
                        error: currentAudio.error
                    });
                    
                    let errorMsg = '播放失败：';
                    if (currentAudio.error) {
                        switch(currentAudio.error.code) {
                            case MediaError.MEDIA_ERR_ABORTED:
                                errorMsg += '用户中止播放';
                                break;
                            case MediaError.MEDIA_ERR_NETWORK:
                                errorMsg += '网络错误，请检查文件路径: ' + audioPath;
                                break;
                            case MediaError.MEDIA_ERR_DECODE:
                                errorMsg += '音频解码错误，文件可能已损坏';
                                break;
                            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                errorMsg += '音频格式不支持或文件不存在: ' + audioPath;
                                break;
                            default:
                                errorMsg += '未知错误';
                        }
                    } else {
                        errorMsg += '请检查音频文件是否存在: ' + audioPath;
                    }
                    alert(errorMsg);
                    playPauseBtn.textContent = '播放';
                };
                currentAudio.addEventListener('error', errorHandler);
                
                // 等待音频可以播放后再尝试播放
                const tryPlay = () => {
                    if (currentAudio.readyState >= 2) { // HAVE_CURRENT_DATA
                        const playPromise = currentAudio.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                console.log('音乐开始播放:', music.name);
                                playPauseBtn.textContent = '暂停';
                            }).catch(error => {
                                console.error('播放失败:', error);
                                console.log('这可能是浏览器自动播放策略限制，请手动点击播放按钮');
                                playPauseBtn.textContent = '播放';
                            });
                        }
                    } else {
                        // 如果还没准备好，等待 canplay 事件
                        currentAudio.addEventListener('canplay', tryPlay, { once: true });
                    }
                };
                
                // 开始加载
                currentAudio.load();
                
                // 尝试播放
                tryPlay();
            })
            .catch(error => {
                console.error('文件检查失败:', error);
                alert('无法找到音频文件: ' + audioPath + '\n请检查文件路径是否正确');
                playPauseBtn.textContent = '播放';
            });

        // 更新UI
        currentMusicName.textContent = music.name;
        audioControl.style.display = 'flex';
        updateActiveMusicItem();
    }

    // 更新激活状态
    function updateActiveMusicItem() {
        document.querySelectorAll('.musicItem').forEach((item, index) => {
            if (index === currentMusicIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // 事件监听
    musicBtn.addEventListener('click', () => {
        musicList.style.display = musicList.style.display === 'block' ? 'none' : 'block';
    });

    playPauseBtn.addEventListener('click', () => {
        if (!currentAudio) {
            // 如果没有音频对象，尝试播放当前选中的音乐
            if (musicFiles.length > 0) {
                playMusic(currentMusicIndex);
            }
            return;
        }

        if (currentAudio.paused) {
            // 如果音频还没准备好，等待加载
            if (currentAudio.readyState < 2) {
                currentAudio.addEventListener('canplay', () => {
                    const playPromise = currentAudio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            playPauseBtn.textContent = '暂停';
                        }).catch(error => {
                            console.error('播放失败:', error);
                            alert('播放失败，请检查音频文件');
                        });
                    }
                }, { once: true });
                currentAudio.load();
            } else {
                const playPromise = currentAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        playPauseBtn.textContent = '暂停';
                    }).catch(error => {
                        console.error('播放失败:', error);
                        alert('播放失败，请检查音频文件');
                    });
                }
            }
        } else {
            currentAudio.pause();
            playPauseBtn.textContent = '播放';
        }
    });

    prevBtn.addEventListener('click', () => {
        currentMusicIndex = (currentMusicIndex - 1 + musicFiles.length) % musicFiles.length;
        playMusic(currentMusicIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
        playMusic(currentMusicIndex);
    });

    // 音乐结束自动播放下一首（已在playMusic函数中处理）
}

// 弹幕系统
function initDanmuSystem() {
    const danmuContainer = document.getElementById('danmuContainer');
    const totalDanmus = 15;

    for (let i = 0; i < totalDanmus; i++) {
        createDanmu(i * 1000);
    }

    function createDanmu(startDelay) {
        const danmu = document.createElement('div');
        danmu.className = 'danmu';

        updateDanmuProperties(danmu);
        danmuContainer.appendChild(danmu);
        activeDanmus.push(danmu);

        setTimeout(() => {
            startDanmuLoop(danmu);
        }, startDelay);
    }

    function updateDanmuProperties(danmu) {
        danmu.textContent = danmuTexts[Math.floor(Math.random() * danmuTexts.length)];
        danmu.style.top = `${Math.random() * 85 + 5}%`;
        danmu.style.fontSize = `${Math.random() * 10 + 14}px`;
        
        // 根据主题选择颜色
        const isDark = document.documentElement.classList.contains('dark');
        let colors;
        if (isDark) {
            // 暗色模式：使用浅色
            colors = ['#fff', '#ffccd5', '#cce5ff', '#e6ffcc', '#ffecce', '#ffcceb'];
        } else {
            // 亮色模式：使用深色
            colors = ['#333', '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#0288d1'];
        }
        danmu.style.color = colors[Math.floor(Math.random() * colors.length)];
    }

    function startDanmuLoop(danmu) {
        const screenWidth = window.innerWidth;
        danmu.style.right = `-${danmu.offsetWidth + 200}px`;

        const duration = Math.random() * 25 + 20;
        const startTime = performance.now();
        const startRight = -(danmu.offsetWidth + 200);
        const endRight = screenWidth + 200;

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);

            const currentRight = startRight + (endRight - startRight) * progress;
            danmu.style.right = `${currentRight}px`;

            if (progress < 1) {
                const id = requestAnimationFrame(animate);
                danmuAnimationIds.push(id);
            } else {
                updateDanmuProperties(danmu);
                setTimeout(() => {
                    startDanmuLoop(danmu);
                }, Math.random() * 1500);
            }
        }

        const id = requestAnimationFrame(animate);
        danmuAnimationIds.push(id);
    }
}

// 粒子效果
function createParticles() {
    const particleContainer = document.getElementById('particleContainer');
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.bottom = `-${size}px`;
        
        // 根据主题选择颜色
        const isDark = document.documentElement.classList.contains('dark');
        let colors;
        if (isDark) {
            // 暗色模式：使用浅色
            colors = ['#fff', '#ffccd5', '#cce5ff', '#e6ffcc', '#ffecce'];
        } else {
            // 亮色模式：使用深色
            colors = ['#333', '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#0288d1'];
        }
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.opacity = `${Math.random() * 0.6 + 0.3}`;

        particleContainer.appendChild(particle);
        particles.push({elem: particle, size: size});

        setTimeout(() => {
            animateParticle(particle, size);
        }, i * 150);
    }
}

function animateParticle(particle, size) {
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = `-${size}px`;
    particle.style.opacity = `${Math.random() * 0.6 + 0.3}`;
    
    // 根据主题更新颜色（在重新动画时）
    const isDark = document.documentElement.classList.contains('dark');
    let colors;
    if (isDark) {
        colors = ['#fff', '#ffccd5', '#cce5ff', '#e6ffcc', '#ffecce'];
    } else {
        colors = ['#333', '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#0288d1'];
    }
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const duration = Math.random() * 5 + 3;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = elapsed / (duration * 1000);

        if (progress < 1) {
            const screenHeight = window.innerHeight;
            particle.style.bottom = `${progress * screenHeight}px`;
            const id = requestAnimationFrame(update);
            particleAnimationIds.push(id);
        } else {
            setTimeout(() => {
                animateParticle(particle, size);
            }, Math.random() * 1000);
        }
    }

    const id = requestAnimationFrame(update);
    particleAnimationIds.push(id);
}

// 主题切换
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // 初始化主题
    const isDark = localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        html.classList.add('dark');
        themeToggle.innerHTML = '<i class="fa fa-sun-o"></i> 亮色模式';
    } else {
        themeToggle.innerHTML = '<i class="fa fa-moon-o"></i> 暗黑模式';
    }

    // 切换主题
    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fa fa-moon-o"></i> 暗黑模式';
            document.body.style.backgroundColor = '#f5f5f5';
            document.getElementById('loveTimer').style.backgroundColor = 'rgba(255,255,255,0.9)';
            document.getElementById('loveTimer').style.color = '#333';
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fa fa-sun-o"></i> 亮色模式';
            document.body.style.backgroundColor = '#000';
            document.getElementById('loveTimer').style.backgroundColor = 'rgba(30,30,30,0.9)';
            document.getElementById('loveTimer').style.color = '#fff';
        }
        
        // 更新所有现有弹幕的颜色
        const danmus = document.querySelectorAll('.danmu');
        danmus.forEach(danmu => {
            const isDark = html.classList.contains('dark');
            let colors;
            if (isDark) {
                colors = ['#fff', '#ffccd5', '#cce5ff', '#e6ffcc', '#ffecce', '#ffcceb'];
            } else {
                colors = ['#333', '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#0288d1'];
            }
            danmu.style.color = colors[Math.floor(Math.random() * colors.length)];
        });
        
        // 更新所有现有粒子的颜色
        const isDark = html.classList.contains('dark');
        let particleColors;
        if (isDark) {
            particleColors = ['#fff', '#ffccd5', '#cce5ff', '#e6ffcc', '#ffecce'];
        } else {
            particleColors = ['#333', '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#0288d1'];
        }
        particles.forEach(particle => {
            particle.elem.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
        });
    });
}

// 预加载图片
function preloadImages() {
    imageList.forEach(img => {
        const preloadImg = new Image();
        preloadImg.src = img.url;
    });

    videoList.forEach(video => {
        const preloadImg = new Image();
        preloadImg.src = video.thumbnail;
    });
}

// 窗口大小变化处理
window.addEventListener('resize', () => {
    // 清除动画
    danmuAnimationIds.forEach(id => cancelAnimationFrame(id));
    particleAnimationIds.forEach(id => cancelAnimationFrame(id));

    // 重新初始化弹幕
    document.getElementById('danmuContainer').innerHTML = '';
    activeDanmus = [];
    danmuAnimationIds = [];
    initDanmuSystem();

    // 重新初始化粒子
    document.getElementById('particleContainer').innerHTML = '';
    particles = [];
    particleAnimationIds = [];
    createParticles();
});

// 页面卸载处理
window.addEventListener('beforeunload', () => {
    // 清除动画
    danmuAnimationIds.forEach(id => cancelAnimationFrame(id));
    particleAnimationIds.forEach(id => cancelAnimationFrame(id));

    // 暂停音频
    if (currentAudio) {
        currentAudio.pause();
    }
});


const audioControl = document.getElementById('audioControl');
let audioTimer = null;

// 鼠标移开时延迟隐藏
audioControl.addEventListener('mouseleave', () => {
  audioTimer = setTimeout(() => {
    audioControl.style.transform = 'translateY(100%)';
  }, 2000);
});

// 鼠标移入时显示
audioControl.addEventListener('mouseenter', () => {
  clearTimeout(audioTimer);
  audioControl.style.transform = 'translateY(0)';
});

// 初始化隐藏
audioControl.style.transform = 'translateY(100%)';
audioControl.style.transition = 'transform 0.3s ease';

// ==================== 服务器文件上传系统 ====================

// 从服务器加载文件列表
async function loadFilesFromServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/files`);
        if (!response.ok) {
            console.warn('无法连接到服务器，使用本地文件');
            return;
        }
        
        const data = await response.json();
        
        // 加载图片
        if (data.images && Array.isArray(data.images)) {
            data.images.forEach(img => {
                if (!imageList.find(i => i.url === img.url)) {
                    imageList.push({
                        url: img.url,
                        alt: img.message
                    });
                }
            });
        }
        
        // 加载视频
        if (data.videos && Array.isArray(data.videos)) {
            data.videos.forEach(video => {
                if (!videoList.find(v => v.url === video.url)) {
                    videoList.push({
                        url: video.url,
                        title: video.message,
                        thumbnail: video.thumbnail || 'images/v_1.jpg'
                    });
                }
            });
        }
        
        // 加载音乐
        if (data.music && Array.isArray(data.music)) {
            data.music.forEach(music => {
                if (!musicFiles.find(m => m.path === music.url)) {
                    musicFiles.push({
                        name: music.message || music.original_name,
                        path: music.url
                    });
                }
            });
        }
    } catch (error) {
        console.warn('加载服务器文件失败，使用本地文件:', error);
    }
}

// 初始化上传系统
function initUploadSystem() {
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const addMusicBtn = document.getElementById('addMusicBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeUploadModal = document.getElementById('closeUploadModal');
    const fileInput = document.getElementById('fileInput');
    const messageInput = document.getElementById('messageInput');
    const messageGroup = document.getElementById('messageGroup');
    const confirmUpload = document.getElementById('confirmUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadModalTitle = document.getElementById('uploadModalTitle');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // 检查必要的元素是否存在
    if (!addVideoBtn || !addImageBtn || !addMusicBtn || !uploadModal || 
        !closeUploadModal || !fileInput || !messageInput || !messageGroup || 
        !confirmUpload || !uploadPreview || !uploadModalTitle) {
        console.warn('上传功能所需的DOM元素未找到，跳过初始化');
        return;
    }

    // 打开上传对话框
    function openUploadModal(type) {
        uploadType = type;
        if (uploadModal) {
            uploadModal.classList.add('active');
        }
        if (fileInput) {
            fileInput.value = '';
        }
        if (messageInput) {
            messageInput.value = '';
        }
        if (uploadPreview) {
            uploadPreview.innerHTML = '';
        }
        if (uploadProgress) {
            uploadProgress.style.display = 'none';
        }
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        if (progressText) {
            progressText.textContent = '0%';
        }
        
        // 设置文件类型和标题
        if (type === 'video') {
            if (fileInput) fileInput.accept = 'video/*';
            if (uploadModalTitle) uploadModalTitle.textContent = '上传视频';
            if (messageGroup) messageGroup.style.display = 'block';
        } else if (type === 'image') {
            if (fileInput) fileInput.accept = 'image/*';
            if (uploadModalTitle) uploadModalTitle.textContent = '上传图片';
            if (messageGroup) messageGroup.style.display = 'block';
        } else if (type === 'music') {
            if (fileInput) fileInput.accept = 'audio/*';
            if (uploadModalTitle) uploadModalTitle.textContent = '上传音乐';
            if (messageGroup) messageGroup.style.display = 'none';
        }
    }

    // 关闭上传对话框
    function closeModal() {
        if (uploadModal) {
            uploadModal.classList.remove('active');
        }
        if (fileInput) {
            fileInput.value = '';
        }
        if (messageInput) {
            messageInput.value = '';
        }
        if (uploadPreview) {
            uploadPreview.innerHTML = '';
        }
        if (uploadProgress) {
            uploadProgress.style.display = 'none';
        }
    }

    // 事件监听（确保元素存在）
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => openUploadModal('video'));
    }
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => openUploadModal('image'));
    }
    if (addMusicBtn) {
        addMusicBtn.addEventListener('click', () => openUploadModal('music'));
    }
    if (closeUploadModal) {
        closeUploadModal.addEventListener('click', closeModal);
    }
    if (uploadModal) {
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                closeModal();
            }
        });
    }
    
    // 文件选择预览（确保元素存在）
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (uploadPreview) {
                uploadPreview.innerHTML = '';
            }
            const reader = new FileReader();

            if (uploadType === 'image') {
                reader.onload = (e) => {
                    if (uploadPreview) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        uploadPreview.appendChild(img);
                    }
                };
                reader.readAsDataURL(file);
            } else if (uploadType === 'video') {
                reader.onload = (e) => {
                    if (uploadPreview) {
                        const video = document.createElement('video');
                        video.src = e.target.result;
                        video.controls = true;
                        uploadPreview.appendChild(video);
                    }
                };
                reader.readAsDataURL(file);
            } else if (uploadType === 'music' && uploadPreview) {
                uploadPreview.innerHTML = `<p>🎵 ${file.name}</p>`;
            }
        });
    }

    // 确认上传（确保元素存在）
    if (confirmUpload) {
        confirmUpload.addEventListener('click', async () => {
            if (!fileInput || !fileInput.files[0]) {
                alert('请选择文件');
                return;
            }

            const file = fileInput.files[0];
            const message = messageInput ? messageInput.value.trim() : '';
            
            if ((uploadType === 'video' || uploadType === 'image') && !message) {
                alert('请输入留言');
                return;
            }

            try {
                // 显示进度条
                if (uploadProgress) {
                    uploadProgress.style.display = 'block';
                }
                if (progressFill) {
                    progressFill.style.width = '0%';
                }
                if (progressText) {
                    progressText.textContent = '0%';
                }
                confirmUpload.disabled = true;
                confirmUpload.textContent = '上传中...';

                // 创建FormData
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', uploadType);
                formData.append('message', message || file.name);

                // 使用XMLHttpRequest以支持上传进度
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable && progressFill && progressText) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        progressFill.style.width = percentComplete + '%';
                        progressText.textContent = Math.round(percentComplete) + '%';
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            alert('上传成功！');
                            closeModal();
                            // 重新加载文件列表
                            loadFilesFromServer().then(() => {
                                renderMusicList();
                                initImageGallery();
                                initVideoGallery();
                            });
                        } else {
                            alert('上传失败：' + (response.error || '未知错误'));
                        }
                    } else {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            alert('上传失败：' + (response.error || '服务器错误'));
                        } catch (e) {
                            alert('上传失败：服务器错误');
                        }
                    }
                    if (confirmUpload) {
                        confirmUpload.disabled = false;
                        confirmUpload.textContent = '确认上传';
                    }
                    if (uploadProgress) {
                        uploadProgress.style.display = 'none';
                    }
                });

                xhr.addEventListener('error', () => {
                    alert('上传失败：网络错误，请检查服务器是否运行');
                    if (confirmUpload) {
                        confirmUpload.disabled = false;
                        confirmUpload.textContent = '确认上传';
                    }
                    if (uploadProgress) {
                        uploadProgress.style.display = 'none';
                    }
                });

                xhr.open('POST', `${API_BASE_URL}/upload`);
                xhr.send(formData);

            } catch (error) {
                console.error('上传错误:', error);
                alert('上传失败：' + error.message);
                if (confirmUpload) {
                    confirmUpload.disabled = false;
                    confirmUpload.textContent = '确认上传';
                }
                if (uploadProgress) {
                    uploadProgress.style.display = 'none';
                }
            }
        });
    }
}