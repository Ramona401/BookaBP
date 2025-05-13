/**
 * Booka乐读 BP - 产品详情模态窗口控制器
 * 专为产品页面处理详情模态窗口交互
 */

// 产品详情模态控制器
const ProductDetailController = {
  
  // 初始化控制器
  init: function() {
    console.log('产品详情模态窗口控制器初始化中...');
    this.bindDetailButtons();
    this.bindVideoPlayers();
    console.log('产品详情模态窗口控制器初始化完成');
  },
  
  // 绑定详情按钮点击事件
  bindDetailButtons: function() {
    // 获取所有详情按钮
    const detailButtons = document.querySelectorAll('.product-card .detail-button');
    console.log('找到详情按钮数量:', detailButtons.length);
    
    detailButtons.forEach(button => {
      // 移除旧事件监听器以避免重复
      button.removeEventListener('click', this.handleDetailButtonClick);
      
      // 添加新事件监听器
      button.addEventListener('click', this.handleDetailButtonClick);
      console.log('已为详情按钮绑定点击事件:', button.getAttribute('data-page'));
    });
    
    // 绑定关闭按钮
    const closeButtons = document.querySelectorAll('.product-detail-overlay .close-detail');
    closeButtons.forEach(button => {
      button.removeEventListener('click', this.handleCloseButtonClick);
      button.addEventListener('click', this.handleCloseButtonClick);
    });
    
    // 绑定模态窗口背景点击
    const overlays = document.querySelectorAll('.product-detail-overlay');
    overlays.forEach(overlay => {
      overlay.removeEventListener('click', this.handleOverlayClick);
      overlay.addEventListener('click', this.handleOverlayClick);
    });
  },
  
  // 绑定视频播放器功能
  bindVideoPlayers: function() {
    const videoContainers = document.querySelectorAll('.product-video');
    console.log('找到视频容器数量:', videoContainers.length);
    
    videoContainers.forEach(container => {
      const video = container.querySelector('.video-element');
      const playButton = container.querySelector('.video-play-button');
      
      if (video && playButton) {
        // 移除旧事件监听器
        playButton.removeEventListener('click', this.handleVideoButtonClick);
        
        // 添加新事件监听器
        playButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          if (video.paused) {
            // 播放视频
            video.play()
              .then(() => {
                // 视频开始播放后，隐藏播放按钮
                playButton.style.opacity = '0';
              })
              .catch(err => {
                console.error('视频播放失败:', err);
              });
          } else {
            // 暂停视频
            video.pause();
            // 显示播放按钮
            playButton.style.opacity = '1';
          }
        });
        
        // 视频结束时显示播放按钮
        video.addEventListener('ended', function() {
          playButton.style.opacity = '1';
        });
        
        // 视频暂停时显示播放按钮
        video.addEventListener('pause', function() {
          playButton.style.opacity = '1';
        });
      }
    });
  },
  
  // 处理详情按钮点击
  handleDetailButtonClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const pageId = this.getAttribute('data-page');
    console.log('详情按钮点击, PageId:', pageId);
    
    if (pageId) {
      const modal = document.getElementById(pageId);
      if (modal) {
        // 打开模态窗口
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('模态窗口已打开:', pageId);
        
        // 初始化模态窗口内的计数动画
        ProductDetailController.initModalCountUp(modal);
      } else {
        console.error('找不到模态窗口:', pageId);
      }
    }
  },
  
  // 处理关闭按钮点击
  handleCloseButtonClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const modal = this.closest('.product-detail-overlay');
    if (modal) {
      // 关闭模态窗口
      modal.classList.remove('active');
      document.body.style.overflow = '';
      console.log('模态窗口已关闭');
    }
  },
  
  // 处理模态窗口背景点击
  handleOverlayClick: function(e) {
    if (e.target === this) {
      // 如果点击的是模态窗口背景，关闭模态窗口
      this.classList.remove('active');
      document.body.style.overflow = '';
      console.log('点击背景关闭模态窗口');
    }
  },
  
  // 初始化模态窗口内的计数动画
  initModalCountUp: function(container) {
    const countElements = container.querySelectorAll('[data-countup]');
    
    countElements.forEach(el => {
      // 如果已经初始化过，跳过
      if (el.dataset.initialized === 'true') return;
      
      const target = parseInt(el.getAttribute('data-countup'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000; // 动画持续2秒
      
      let startTimestamp = null;
      
      function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easedProgress * target);
        
        el.textContent = currentValue + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // 动画完成后标记为已初始化
          el.dataset.initialized = 'true';
        }
      }
      
      // 直接启动动画
      requestAnimationFrame(step);
    });
  }
};

// 监听ESC键关闭模态窗口
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.product-detail-overlay.active');
    activeModals.forEach(modal => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// 设置MutationObserver监控DOM变化
const setupProductPageObserver = function() {
  // 创建观察器实例
  const observer = new MutationObserver((mutations) => {
    let shouldRebind = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 检查是否添加了产品卡片相关元素
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1) { // 元素节点
            if (
              (node.classList && (
                node.classList.contains('product-card') ||
                node.classList.contains('product-video') ||
                node.classList.contains('detail-button')
              )) ||
              (node.querySelector && (
                node.querySelector('.product-card') ||
                node.querySelector('.product-video') ||
                node.querySelector('.detail-button')
              ))
            ) {
              shouldRebind = true;
              break;
            }
          }
        }
      }
    });
    
    if (shouldRebind) {
      console.log('检测到产品页面DOM变化，重新绑定事件');
      setTimeout(() => {
        ProductDetailController.init();
      }, 100);
    }
  });
  
  // 配置观察选项
  const config = { 
    childList: true, 
    subtree: true 
  };
  
  // 开始观察文档
  observer.observe(document, config);
};

// 判断当前页面是否为产品页面
const isProductPage = function() {
  // 通过检查页面中的特定元素来判断是否为产品页
  return !!document.querySelector('.product-wrapper') || 
         window.location.href.includes('page7') ||
         document.title.includes('产品体系');
};

// 初始化控制器
const initProductDetailController = function() {
  if (isProductPage()) {
    console.log('当前页面是产品页面，初始化产品详情控制器');
    ProductDetailController.init();
    setupProductPageObserver();
  } else {
    console.log('当前页面不是产品页面，跳过初始化产品详情控制器');
  }
};

// 在DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductDetailController);
} else {
  // DOM已加载完成
  initProductDetailController();
}

// 监听页面加载事件，以便在页面导航后重新初始化
document.addEventListener('pageLoaded', function(e) {
  if (e.detail && e.detail.pageId === 'page7-product') {
    console.log('检测到页面7加载完成，初始化产品详情模块');
    setTimeout(initProductDetailController, 200);
  }
});

// 创建全局引用
window.ProductDetailController = ProductDetailController;

console.log('detail-modals.js 已加载');
