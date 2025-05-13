/**
 * Booka乐读 BP - 投资亮点详情模态窗口控制器
 * 处理亮点卡片详情页的模态窗口显示
 */

const DetailModalController = {
  // 模态窗口状态
  isModalOpen: false,
  
  // 初始化
  init: function() {
    // 修改page2-highlights页中的亮点卡片点击行为
    this.setupHighlightCardClickHandlers();
  },
  
  // 设置亮点卡片点击处理
  setupHighlightCardClickHandlers: function() {
    // 当在page2-highlights页面时设置点击处理
    document.addEventListener('modal:setupCardHandlers', () => {
      const cards = document.querySelectorAll('.highlight-card');
      const detailButtons = document.querySelectorAll('.detail-button[data-page]');
      
      // 设置卡片点击处理
      cards.forEach(card => {
        card.addEventListener('click', (e) => {
          // 避免点击"了解详情"按钮时触发卡片的点击事件
          if (e.target.closest('.detail-button')) {
            return;
          }
          
          const pageId = card.getAttribute('data-page');
          if (pageId && pageId.match(/^page[3456]/)) {
            e.preventDefault();
            e.stopPropagation();
            this.openDetailModal(pageId);
          }
        });
      });
      
      // 设置详情按钮点击处理
      detailButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const pageId = button.getAttribute('data-page');
          if (pageId && pageId.match(/^page[3456]/)) {
            e.preventDefault();
            e.stopPropagation();
            this.openDetailModal(pageId);
          }
        });
      });
    });
  },
  
  // 打开详情模态窗口
  openDetailModal: function(pageId) {
    if (this.isModalOpen) return;
    
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;
    
    // 显示加载指示器
    if (window.NavigationController) {
      window.NavigationController.showLoader();
    }
    
    // 加载页面内容
    fetch(`pages/${pageId}.html`)
      .then(response => response.text())
      .then(html => {
        modalContainer.innerHTML = html;
        modalContainer.classList.add('active');
        this.isModalOpen = true;
        
        // 隐藏加载指示器
        if (window.NavigationController) {
          window.NavigationController.hideLoader();
        }
        
        // 设置关闭按钮事件
        this.setupCloseButtons();
      })
      .catch(error => {
        console.error('Error loading modal page:', error);
        if (window.NavigationController) {
          window.NavigationController.hideLoader();
        }
      });
  },
  
  // 设置关闭按钮事件
  setupCloseButtons: function() {
    const closeButtons = document.querySelectorAll('.modal-close, .close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.closeDetailModal();
      });
    });
    
    // 点击模态框背景也可以关闭
    const modalContainer = document.getElementById('modal-container');
    modalContainer.addEventListener('click', (e) => {
      // 仅当点击背景时关闭，不要在点击模态内容时关闭
      if (e.target === modalContainer) {
        this.closeDetailModal();
      }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeDetailModal();
      }
    });
  },
  
  // 关闭详情模态窗口
  closeDetailModal: function() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.classList.remove('active');
      
      // 等待过渡效果完成后清空内容
      setTimeout(() => {
        modalContainer.innerHTML = '';
        this.isModalOpen = false;
      }, 300);
    }
  }
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', function() {
  DetailModalController.init();
});

// 导出控制器
window.DetailModalController = DetailModalController;
