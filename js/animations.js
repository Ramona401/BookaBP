/**
 * Booka乐读 BP - 动画与转场控制
 * 处理页面转场、元素动画和交互效果
 */

const AnimationController = {
  
  // 初始化动画系统
  init: function() {
    this.setupIntersectionObserver();
    this.setupCardAnimations();
    this.setupTypewriterEffect();
    this.setupCountUpAnimation();
  },
  
  // 设置交叉观察器，用于滚动触发动画
  setupIntersectionObserver: function() {
    // 检查浏览器兼容性
    if (!('IntersectionObserver' in window)) {
      // 如果不支持，直接显示所有动画元素
      document.querySelectorAll('.animate').forEach(el => {
        el.style.opacity = 1;
      });
      return;
    }
    
    // 创建观察器
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入视口，播放动画
          entry.target.classList.add(entry.target.dataset.animation || 'fade-in');
          // 只观察一次
          observer.unobserve(entry.target);
        }
      });
    }, {
      // 设置视口的交叉比例
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px' // 提前触发动画
    });
    
    // 观察所有带animate类的元素
    document.querySelectorAll('.animate').forEach(el => {
      observer.observe(el);
    });
  },
  
  // 设置卡片悬停动画
  setupCardAnimations: function() {
    const cards = document.querySelectorAll('.card, .value-card');
    
    cards.forEach(card => {
      // 添加3D悬停效果
      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return; // 移动设备不启用
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // 鼠标在卡片内的X位置
        const y = e.clientY - rect.top; // 鼠标在卡片内的Y位置
        
        // 将位置转换为-20到20度的旋转角度
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = ((x - centerX) / centerX) * 5; // X控制Y轴旋转
        const rotateX = -((y - centerY) / centerY) * 5; // Y控制X轴旋转
        
        // 应用3D旋转效果
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // 添加高光效果
        const glowOpacity = Math.min(Math.max(Math.abs(rotateX) + Math.abs(rotateY), 0), 20) / 100;
        card.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.1), 
                               0 0 30px rgba(255, 214, 0, ${0.2 + glowOpacity})`;
      });
      
      // 鼠标离开恢复原状
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  },
  
  // 设置打字机效果
  setupTypewriterEffect: function() {
    const typewriterElements = document.querySelectorAll('.typewriter-text');
    
    typewriterElements.forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      el.style.display = 'inline-block';
      
      // 创建交叉观察器，进入视图后开始打字效果
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          let i = 0;
          const typeInterval = setInterval(() => {
            if (i < text.length) {
              el.textContent += text.charAt(i);
              i++;
            } else {
              clearInterval(typeInterval);
              el.classList.add('typing-done');
            }
          }, 70); // 调整打字速度
          
          observer.unobserve(el);
        }
      });
      
      observer.observe(el);
    });
  },
  
  // 设置数字增长动画
  setupCountUpAnimation: function() {
    const countElements = document.querySelectorAll('[data-countup]');
    
    countElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-countup'));
      const duration = parseInt(el.getAttribute('data-duration') || '2000');
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      
      el.textContent = prefix + '0' + suffix;
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          let startTime = null;
          
          function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            
            // 计算当前值（使用缓动函数）
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(easedProgress * target);
            
            el.textContent = prefix + currentValue + suffix;
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
          
          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      });
      
      observer.observe(el);
    });
  },
  
  // 应用页面转场动画
  pageTransition: function(currentPage, targetPage, direction) {
    // 方向: 'next' 或 'prev'
    return new Promise((resolve) => {
      // 准备页面转换
      if (direction === 'next') {
        targetPage.classList.add('next');
        targetPage.classList.remove('prev', 'active');
      } else {
        targetPage.classList.add('prev');
        targetPage.classList.remove('next', 'active');
      }
      
      // 强制重排，确保转换正确开始
      void targetPage.offsetWidth;
      
      // 应用转换
      requestAnimationFrame(() => {
        // 当前页面淡出
        currentPage.classList.remove('active');
        currentPage.classList.add(direction === 'next' ? 'prev' : 'next');
        
        // 目标页面淡入
        targetPage.classList.remove('next', 'prev');
        targetPage.classList.add('active');
        
        // 转换完成后解决承诺
        setTimeout(() => {
          resolve();
          // 激活目标页面中的动画元素
          this.activatePageAnimations(targetPage);
        }, 800); // 与CSS过渡时间匹配
      });
    });
  },
  
  // 激活特定页面内的动画元素
  activatePageAnimations: function(page) {
    const animElements = page.querySelectorAll('.animate');
    
    animElements.forEach((el, index) => {
      // 使用序列延迟
      setTimeout(() => {
        el.classList.add(el.dataset.animation || 'fade-in');
      }, 100 * index); // 每个元素延迟100ms
    });
    
    // 激活顺序序列
    const sequences = page.querySelectorAll('.fade-sequence');
    sequences.forEach(sequence => {
      const items = sequence.children;
      Array.from(items).forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('fade-in');
        }, 150 * index);
      });
    });
  },
  
  // 应用震动/强调动画
  applyVibration: function(element) {
    element.classList.add('vibrate');
    setTimeout(() => {
      element.classList.remove('vibrate');
    }, 300);
  },
  
  // 应用闪光高亮效果
  applyFlashHighlight: function(element) {
    const flash = document.createElement('div');
    flash.className = 'flash-highlight';
    element.appendChild(flash);
    
    setTimeout(() => {
      flash.remove();
    }, 500);
  }
};

// 页面加载后初始化动画系统
document.addEventListener('DOMContentLoaded', function() {
  AnimationController.init();
});

// 导出动画控制器
window.AnimationController = AnimationController;
