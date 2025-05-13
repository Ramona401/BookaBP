/**
 * Booka乐读 BP - 主应用控制
 * 处理应用初始化和全局功能集成
 */

// 应用主控制器
const AppController = {
  
  // 初始化应用
  init: function() {
    this.initLoading();
    this.initFirstPage();
    this.setupGlobalEvents();
    this.detectSystemCapabilities();
    this.setupSwipeHint();
    this.setupDeviceSpecificOptimizations();
  },
  
  // 初始化加载屏幕
  initLoading: function() {
    const loader = document.getElementById('page-loader');
    
    // 预加载关键资源
    this.preloadCriticalResources()
      .then(() => {
        // 延迟一段时间显示加载完成动画
        setTimeout(() => {
          if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
          }
        }, 1500);
      })
      .catch(error => {
        console.error('资源加载失败:', error);
        // 即使出错也继续显示应用
        if (loader) {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
        }
      });
  },
  
  // 预加载关键资源
  preloadCriticalResources: function() {
    return new Promise((resolve) => {
      // 预加载首页图像
      const criticalImages = [
        'images/logo.png',
        'images/immersive-reading.jpg',
        'images/ai-coach.jpg'
      ];
      
      let loadedCount = 0;
      const totalResources = criticalImages.length;
      
      // 如果没有资源需要预加载，直接解析
      if (totalResources === 0) {
        resolve();
        return;
      }
      
      // 预加载每个图像
      criticalImages.forEach(src => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          // 更新加载进度条
          this.updateLoadingProgress(loadedCount / totalResources);
          
          if (loadedCount === totalResources) {
            resolve();
          }
        };
        img.src = src;
      });
      
      // 为了防止无限等待，设置一个超时
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  },
  
  // 更新加载进度条
  updateLoadingProgress: function(percentage) {
    const loaderBar = document.querySelector('.loader-bar');
    if (loaderBar) {
      const afterElem = document.createElement('style');
      afterElem.textContent = `.loader-bar::after { transform: translateX(${percentage * 100 - 50}%); }`;
      document.head.appendChild(afterElem);
    }
  },
  
  // 初始化首页
  initFirstPage: function() {
    // 获取URL哈希参数，或者默认为首页
    const hashPageId = window.location.hash.substring(1);
    const initialPageId = hashPageId || 'page1-cover';
    
    // 从DOM中获取页面容器和导航项
    const pageContainer = document.getElementById('page-container');
    const navItems = document.querySelectorAll('.nav-item');
    
    // 加载首页
    fetch(`pages/${initialPageId}.html`)
      .then(response => response.text())
      .then(html => {
        // 创建首页元素
        const pageElement = document.createElement('div');
        pageElement.id = initialPageId;
        pageElement.className = 'page active';
        pageElement.innerHTML = html;
        
        // 添加到容器
        pageContainer.appendChild(pageElement);
        
        // 更新导航状态
        navItems.forEach(item => {
          if (item.getAttribute('data-page') === initialPageId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
        
        // 激活页面内动画
        window.AnimationController.activatePageAnimations(pageElement);
      })
      .catch(error => {
        console.error('Error loading first page:', error);
        // 加载失败时显示错误消息
        pageContainer.innerHTML = `
          <div class="error-container">
            <h2>加载失败</h2>
            <p>无法加载页面内容，请刷新重试。</p>
          </div>
        `;
      });
  },
  
  // 设置全局事件
  setupGlobalEvents: function() {
    // 为下一页按钮添加事件
    const nextButton = document.getElementById('next-page');
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        const activeNavItem = document.querySelector('.nav-item.active');
        const navItems = Array.from(document.querySelectorAll('.nav-item'));
        const currentIndex = navItems.indexOf(activeNavItem);
        
        if (currentIndex < navItems.length - 1) {
          const nextPageId = navItems[currentIndex + 1].getAttribute('data-page');
          window.NavigationController.navigateToPage(nextPageId, 'next');
        }
      });
    }
  },
  
  // 检测系统能力
  detectSystemCapabilities: function() {
    // 检测性能
    const isLowEndDevice = () => {
      const isLowRAM = navigator.deviceMemory && navigator.deviceMemory < 4;
      const isSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      return isLowRAM || isSlowCPU || this.isMobile();
    };
    
    // 检测减弱动画偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 应用适当的性能模式
    if (isLowEndDevice() || prefersReducedMotion) {
      document.body.classList.add('low-performance');
    }
    
    // 检测黑暗模式偏好
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      document.body.classList.add('dark-mode');
    }
  },
  
  // 为移动设备设置滑动提示
  setupSwipeHint: function() {
    if (this.isMobile() && !this.getCookie('swipeHintDismissed')) {
      const hintElement = document.createElement('div');
      hintElement.className = 'swipe-hint';
      hintElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
        <span>左右滑动切换页面</span>
      `;
      
      document.body.appendChild(hintElement);
      
      // 5秒后自动隐藏
      setTimeout(() => {
        hintElement.style.opacity = '0';
        setTimeout(() => {
          hintElement.remove();
        }, 500);
      }, 5000);
      
      // 点击隐藏
      hintElement.addEventListener('click', () => {
        hintElement.style.opacity = '0';
        setTimeout(() => {
          hintElement.remove();
        }, 500);
      });
      
      // 设置cookie，下次不再显示
      this.setCookie('swipeHintDismissed', 'true', 30);
    }
  },
  
  // 设置设备特定优化
  setupDeviceSpecificOptimizations: function() {
    // 针对iOS设备的特定优化
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      document.documentElement.classList.add('ios-device');
      
      // iOS滚动优化
      document.addEventListener('touchmove', function(e) {
        // 允许模态框内部滚动
        if (e.target.closest('.card-detail-container, .detail-container')) {
          e.stopPropagation();
        }
      }, { passive: false });
    }
    
    // 针对Android设备的特定优化
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid) {
      document.documentElement.classList.add('android-device');
    }
    
    // 针对低端设备的优化
    if (this.isMobile()) {
      // 降低背景效果质量
      this.optimizeBackgroundEffects();
    }
  },
  
  // 优化背景效果
  optimizeBackgroundEffects: function() {
    // 减少数据流数量
    const dataStreams = document.querySelectorAll('.data-stream');
    if (dataStreams.length > 3) {
      for (let i = 3; i < dataStreams.length; i++) {
        dataStreams[i].remove();
      }
    }
    
    // 降低数字雨密度
    const rainColumns = document.querySelectorAll('.rain-column');
    if (rainColumns.length > 5) {
      for (let i = 5; i < rainColumns.length; i++) {
        rainColumns[i].remove();
      }
    }
  },
  
  // 设置cookie
  setCookie: function(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  },
  
  // 获取cookie
  getCookie: function(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  // 检测是否为移动设备
  isMobile: function() {
    return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
};

// 确保HTML正确加载后再执行应用初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化主应用
  AppController.init();
});

// 导出应用控制器
window.AppController = AppController;
