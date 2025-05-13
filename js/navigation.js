/**
 * Booka乐读 BP - 导航与页面管理
 * 处理页面切换、导航状态和交互
 */

const NavigationController = {
  
  // 存储状态
  state: {
    currentPageIndex: 0,
    totalPages: 0,
    isTransitioning: false,
    pages: [],
    preloadedPages: {}
  },
  
  // 初始化导航系统
  init: function() {
    this.cacheElements();
    this.bindEvents();
    this.setupProgressBar();
    this.preloadAdjacentPages();
  },
  
  // 缓存DOM元素
  cacheElements: function() {
    this.pageContainer = document.getElementById('page-container');
    this.navItems = document.querySelectorAll('.nav-item');
    this.state.totalPages = this.navItems.length;
    
    // 获取所有页面ID
    this.state.pages = Array.from(this.navItems).map(item => 
      item.getAttribute('data-page')
    );
    
    // 缓存导航按钮
    this.prevBtn = document.getElementById('prev-page');
    this.nextBtn = document.getElementById('next-page');
  },
  
  // 绑定事件处理器
  bindEvents: function() {
    // 导航点击事件
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = item.getAttribute('data-page');
        
        // 如果已经是活动页面，不做任何事
        if (item.classList.contains('active') || this.state.isTransitioning) return;
        
        // 计算页面索引和方向
        const targetIndex = this.state.pages.indexOf(targetPage);
        const direction = targetIndex > this.state.currentPageIndex ? 'next' : 'prev';
        
        // 导航到目标页面
        this.navigateToPage(targetPage, direction);
      });
    });
    
    // **新增代码 - 处理详情按钮点击**
    document.addEventListener('click', (e) => {
      const detailButton = e.target.closest('.detail-button[data-page]');
      if (detailButton) {
        e.preventDefault();
        e.stopPropagation();
        
        const pageId = detailButton.getAttribute('data-page');
        if (!pageId || this.state.isTransitioning) return;
        
        console.log('通过详情按钮导航到:', pageId);
        this.navigateToPage(pageId, 'next');
      }
    });
    
    // 左右翻页按钮事件
    if (this.prevBtn && this.nextBtn) {
      // 初始状态 - 首页时禁用上一页按钮
      this.updatePrevNextButtons();
      
      // 下一页按钮事件
      this.nextBtn.addEventListener('click', () => {
        if (this.nextBtn.classList.contains('disabled') || this.state.isTransitioning) return;
        
        const currentIndex = this.state.currentPageIndex;
        if (currentIndex < this.state.totalPages - 1) {
          const nextPageId = this.state.pages[currentIndex + 1];
          this.navigateToPage(nextPageId, 'next');
        }
      });
      
      // 上一页按钮事件
      this.prevBtn.addEventListener('click', () => {
        if (this.prevBtn.classList.contains('disabled') || this.state.isTransitioning) return;
        
        const currentIndex = this.state.currentPageIndex;
        if (currentIndex > 0) {
          const prevPageId = this.state.pages[currentIndex - 1];
          this.navigateToPage(prevPageId, 'prev');
        }
      });
    }
    
    // 键盘导航
    document.addEventListener('keydown', (e) => {
      if (this.state.isTransitioning) return;
      
      const currentIndex = this.state.currentPageIndex;
      
      // 左右箭头导航
      if (e.key === 'ArrowRight' && currentIndex < this.state.totalPages - 1) {
        this.navigateToPage(this.state.pages[currentIndex + 1], 'next');
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        this.navigateToPage(this.state.pages[currentIndex - 1], 'prev');
      }
    });
    
    // 滑动导航
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
      if (this.state.isTransitioning) return;
      
      touchEndX = e.changedTouches[0].screenX;
      
      // 计算滑动距离和方向
      const swipeDistance = touchEndX - touchStartX;
      const threshold = 100; // 最小滑动距离
      
      if (swipeDistance > threshold && this.state.currentPageIndex > 0) {
        // 向右滑动，去上一页
        this.navigateToPage(this.state.pages[this.state.currentPageIndex - 1], 'prev');
      } else if (swipeDistance < -threshold && this.state.currentPageIndex < this.state.totalPages - 1) {
        // 向左滑动，去下一页
        this.navigateToPage(this.state.pages[this.state.currentPageIndex + 1], 'next');
      }
    });
    
    // 返回顶部按钮
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // 检测滚动位置，显示/隐藏按钮
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });
    }
    
    // 窗口大小改变时重新调整
    window.addEventListener('resize', () => {
      this.adjustActivePage();
    });
  },
  
  // 更新左右翻页按钮状态
  updatePrevNextButtons: function() {
    if (!this.prevBtn || !this.nextBtn) return;
    
    const currentIndex = this.state.currentPageIndex;
    
    // 更新上一页按钮
    if (currentIndex <= 0) {
      this.prevBtn.classList.add('disabled');
    } else {
      this.prevBtn.classList.remove('disabled');
    }
    
    // 更新下一页按钮
    if (currentIndex >= this.state.totalPages - 1) {
      this.nextBtn.classList.add('disabled');
    } else {
      this.nextBtn.classList.remove('disabled');
    }
  },
  
  // 预加载相邻页面
  preloadAdjacentPages: function() {
    setTimeout(() => {
      const currentIndex = this.state.currentPageIndex;
      
      // 预加载下一页
      if (currentIndex < this.state.totalPages - 1) {
        this.preloadPage(this.state.pages[currentIndex + 1]);
      }
      
      // 预加载前一页
      if (currentIndex > 0) {
        this.preloadPage(this.state.pages[currentIndex - 1]);
      }
    }, 1000); // 等待当前页加载完成
  },
  
  // 预加载特定页面
  preloadPage: function(pageId) {
    if (this.state.preloadedPages[pageId]) return;
    
    fetch(`pages/${pageId}.html`)
      .then(response => response.text())
      .then(html => {
        // 缓存页面HTML
        this.state.preloadedPages[pageId] = html;
        console.log(`Preloaded: ${pageId}`);
      })
      .catch(error => {
        console.error(`Error preloading page ${pageId}:`, error);
      });
  },
  
  // 导航到特定页面
  navigateToPage: function(pageId, direction) {
    if (this.state.isTransitioning) return;
    this.state.isTransitioning = true;
    
    // 获取当前活动页面
    const currentPage = document.querySelector('.page.active');
    
    // 检查页面是否已加载
    const existingPage = document.getElementById(pageId);
    if (existingPage) {
      // 使用动画控制器处理转场
      window.AnimationController.pageTransition(currentPage, existingPage, direction)
        .then(() => {
          this.finalizePageTransition(pageId);
        });
      return;
    }
    
    // 显示加载指示器
    this.showLoader();
    
    // 使用预加载的页面或正常加载
    const fetchPage = () => {
      if (this.state.preloadedPages[pageId]) {
        return Promise.resolve(this.state.preloadedPages[pageId]);
      } else {
        return fetch(`pages/${pageId}.html`).then(response => response.text());
      }
    };
    
    fetchPage()
      .then(html => {
        // 创建新页面元素
        const pageElement = document.createElement('div');
        pageElement.id = pageId;
        pageElement.className = 'page ' + (direction === 'next' ? 'next' : 'prev');
        pageElement.innerHTML = html;
        
        // 添加到容器
        this.pageContainer.appendChild(pageElement);
        
        // 隐藏加载指示器
        this.hideLoader();
        
        // 允许DOM更新
        setTimeout(() => {
          // 使用动画控制器处理转场
          window.AnimationController.pageTransition(currentPage, pageElement, direction)
            .then(() => {
              this.finalizePageTransition(pageId);
            });
        }, 50);
      })
      .catch(error => {
        console.error('Error loading page:', error);
        this.hideLoader();
        this.state.isTransitioning = false;
      });
  },
  
  // 添加到finalizePageTransition函数末尾
document.dispatchEvent(new CustomEvent('page:changed', {
  detail: { pageId: pageId }
}));

  // 完成页面转场
  finalizePageTransition: function(pageId) {
    // 更新导航状态
    this.updateNavigation(pageId);
    
    // 更新当前页面索引
    this.state.currentPageIndex = this.state.pages.indexOf(pageId);
    
    // 更新左右翻页按钮状态
    this.updatePrevNextButtons();
    
    // 重置转场标志
    this.state.isTransitioning = false;
    
    // 更新URL哈希（可选）
    if (history.pushState) {
      history.pushState(null, null, `#${pageId}`);
    } else {
      location.hash = `#${pageId}`;
    }
    
    // 更新进度条
    this.updateProgressBar();
    
    // 预加载下一个相邻页面
    this.preloadAdjacentPages();
    
    // 初始化页面特定脚本
    this.initPageScripts(pageId);
    
    // 滚动到顶部
    window.scrollTo(0, 0);
  },
  
  // 更新导航状态
  updateNavigation: function(pageId) {
    this.navItems.forEach(item => {
      if (item.getAttribute('data-page') === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },
  
  // 设置进度条
  setupProgressBar: function() {
    const progressContainer = document.querySelector('.progress-bar');
    if (!progressContainer) {
      const newProgressContainer = document.createElement('div');
      newProgressContainer.className = 'progress-bar';
      
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      
      newProgressContainer.appendChild(progressFill);
      document.body.appendChild(newProgressContainer);
    }
    
    // 初始化进度条
    this.updateProgressBar();
  },
  
  // 更新进度条
  updateProgressBar: function() {
    const progressFill = document.querySelector('.progress-fill');
    if (!progressFill) return;
    
    const progress = ((this.state.currentPageIndex + 1) / this.state.totalPages) * 100;
    progressFill.style.width = `${progress}%`;
  },
  
   // 调整当前活动页面的位置和大小
  adjustActivePage: function() {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      // 确保活动页面位于正确位置
      activePage.style.transform = 'translateX(0)';
    }
  },
  
  // 初始化页面特定脚本
  initPageScripts: function(pageId) {
    // 每个页面可能需要特定的初始化逻辑
    switch(pageId) {
      case 'page2-highlights':
        this.initCardInteractions();
        // 触发亮点卡片处理事件
      document.dispatchEvent(new CustomEvent('modal:setupCardHandlers'));
        break;
      case 'page5-ai-chain':
        this.initAIChainVisuals();
        break;
      case 'page6-roi-model':
        this.initROICharts();
        break;
      // 其他页面特定初始化...
    }
  },
  
  // 投资亮点页卡片交互
  initCardInteractions: function() {
    const cards = document.querySelectorAll('.value-card');
    const detailOverlays = document.querySelectorAll('.card-detail-overlay');
    const closeButtons = document.querySelectorAll('.close-detail');
    
    // 打开详情
    cards.forEach(card => {
      card.addEventListener('click', function() {
        const cardId = this.getAttribute('data-card');
        const targetOverlay = document.getElementById(`card-detail-${cardId}`);
        if (targetOverlay) {
          targetOverlay.classList.add('active');
          document.body.style.overflow = 'hidden'; // 防止背景滚动
        }
      });
    });
    
    // 关闭详情
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const overlay = this.closest('.card-detail-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
    
    // 点击空白处关闭
    detailOverlays.forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
    });
  },
  
  // AI链路图初始化
  initAIChainVisuals: function() {
    // 初始化AI链路交互元素，例如点击环节展示详情
    const chainNodes = document.querySelectorAll('.chain-node');
    const detailPanels = document.querySelectorAll('.chain-detail');
    
    chainNodes.forEach(node => {
      node.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        
        // 重置所有节点和面板
        chainNodes.forEach(n => n.classList.remove('active'));
        detailPanels.forEach(p => p.classList.remove('active'));
        
        // 激活目标节点和面板
        this.classList.add('active');
        document.getElementById(targetId).classList.add('active');
      });
    });
  },
  
  // ROI图表初始化
  initROICharts: function() {
    // 检查是否有图表库
    if (typeof Chart !== 'undefined') {
      // 初始化ROI图表
      const ctx = document.getElementById('roi-chart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['0', '3', '6', '9', '12', '15'],
            datasets: [{
              label: '累计收入',
              data: [0, 30, 80, 120, 170, 220],
              borderColor: '#ffd600',
              backgroundColor: 'rgba(255, 214, 0, 0.1)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }
          }
        });
      }
    }
  },
  
  // 显示加载指示器
  showLoader: function() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '1';
      loader.style.visibility = 'visible';
    }
  },
  
  // 隐藏加载指示器
  hideLoader: function() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }
  }
};

// 页面加载后初始化导航系统
document.addEventListener('DOMContentLoaded', function() {
  NavigationController.init();
});

// 导出导航控制器
window.NavigationController = NavigationController;


