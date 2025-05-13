/**
 * Booka乐读 BP - 模态框和弹窗管理
 * 处理各种交互式弹窗、详情展示和通知
 */

const ModalController = {
  
  // 模态框状态
  state: {
    activeModals: [],
    zIndexCounter: 1000
  },
  
  // 初始化模态框控制
  init: function() {
    this.setupCardDetailModals();
    this.setupProductDetailModals();
    this.setupGenericModals();
    this.handleEscapeKey();
  },
  
  // 设置投资亮点卡片详情模态框
  setupCardDetailModals: function() {
    // 获取所有卡片和卡片详情弹窗
    const cards = document.querySelectorAll('.value-card');
    
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // 防止事件传播到其他元素
        e.stopPropagation();
        
        const cardId = card.getAttribute('data-card');
        const detailModal = document.getElementById(`card-detail-${cardId}`);
        
        if (detailModal) {
          // 显示模态框
          this.openModal(detailModal);
          
          // 添加观察动效
          this.animateModalContent(detailModal);
        }
      });
    });
  },
  
  // 设置产品详情模态框
  setupProductDetailModals: function() {
    const detailButtons = document.querySelectorAll('.product-card .detail-button');
    
    detailButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const detailModal = document.getElementById(`product-detail-${index + 1}`);
        if (detailModal) {
          this.openModal(detailModal);
          this.animateModalContent(detailModal);
        }
      });
    });
  },
  
  // 设置通用模态框交互
  setupGenericModals: function() {
    // 关闭按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('.close-detail') || e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.card-detail-overlay, .product-detail-overlay, .modal-overlay');
        if (modal) {
          this.closeModal(modal);
        }
      }
    });
    
    // 初始化模态框触发器
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = trigger.getAttribute('data-modal-target');
        const modal = document.getElementById(targetId);
        
        if (modal) {
          this.openModal(modal);
        }
      });
    });
  },
  
  // 处理ESC键关闭模态框
  handleEscapeKey: function() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.activeModals.length > 0) {
        // 关闭最上层的模态框
        const lastModal = this.state.activeModals[this.state.activeModals.length - 1];
        this.closeModal(lastModal);
      }
    });
  },
  
  // 打开模态框
  openModal: function(modal) {
    // 添加活动类
    modal.classList.add('active');
    
    // 禁用背景滚动
    document.body.style.overflow = 'hidden';
    
    // 设置z-index确保叠加顺序正确
    modal.style.zIndex = this.state.zIndexCounter++;
    
    // 添加到活动模态框数组
    this.state.activeModals.push(modal);
    
    // 触发打开事件
    const event = new CustomEvent('modal:opened', {
      detail: { modalId: modal.id }
    });
    document.dispatchEvent(event);
  },
  
  // 关闭模态框
  closeModal: function(modal) {
    // 删除活动类
    modal.classList.remove('active');
    
    // 从活动数组中移除
    const index = this.state.activeModals.indexOf(modal);
    if (index > -1) {
      this.state.activeModals.splice(index, 1);
    }
    
    // 如果没有活动模态框，恢复背景滚动
    if (this.state.activeModals.length === 0) {
      document.body.style.overflow = '';
    }
    
    // 触发关闭事件
    const event = new CustomEvent('modal:closed', {
      detail: { modalId: modal.id }
    });
    document.dispatchEvent(event);
  },
  
  // 动画模态框内容
  animateModalContent: function(modal) {
    // 添加进场动画到模态框内容
    const container = modal.querySelector('.card-detail-container, .detail-container');
    if (container) {
      requestAnimationFrame(() => {
        // 首先重置
        container.style.opacity = '0';
        container.style.transform = 'translateY(50px)';
        
        // 然后添加动画
        requestAnimationFrame(() => {
          container.style.opacity = '1';
          container.style.transform = 'translateY(0)';
        });
      });
    }
    
    // 逐项添加动画到内容元素
    const animElements = modal.querySelectorAll('.detail-content > div > *');
    animElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s, transform 0.5s';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 300 + (index * 100));
    });
  },
  
  // 创建和显示通知弹窗
  showNotification: function(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // 设置通知内容
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${this.getNotificationIcon(type)}
        </div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">×</button>
    `;
    
    // 添加到文档
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // 关闭按钮事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.closeNotification(notification);
    });
    
    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.closeNotification(notification);
      }, duration);
    }
    
    return notification;
  },
  
  // 关闭通知
  closeNotification: function(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  },
  
  // 获取通知图标
  getNotificationIcon: function(type) {
    switch (type) {
      case 'success':
        return '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      case 'error':
        return '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      case 'warning':
        return '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      default: // info
        return '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
  },
  
  // 创建确认对话框
  createConfirmDialog: function(options) {
    return new Promise((resolve) => {
      // 设置默认选项
      const config = Object.assign({
        title: '确认',
        message: '您确定要执行此操作吗？',
        confirmText: '确认',
        cancelText: '取消',
        confirmButtonClass: 'btn-primary',
        cancelButtonClass: 'btn-outline'
      }, options);
      
      // 创建模态框元素
      const dialogEl = document.createElement('div');
      dialogEl.className = 'modal-overlay confirm-dialog';
      
      // 设置内容
      dialogEl.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h3>${config.title}</h3>
          </div>
          <div class="modal-body">
            <p>${config.message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn ${config.cancelButtonClass} cancel-btn">${config.cancelText}</button>
            <button class="btn ${config.confirmButtonClass} confirm-btn">${config.confirmText}</button>
          </div>
        </div>
      `;
      
      // 添加到文档
      document.body.appendChild(dialogEl);
      
      // 显示对话框
      this.openModal(dialogEl);
      
      // 绑定按钮事件
      const confirmBtn = dialogEl.querySelector('.confirm-btn');
      const cancelBtn = dialogEl.querySelector('.cancel-btn');
      
      confirmBtn.addEventListener('click', () => {
        this.closeModal(dialogEl);
        setTimeout(() => {
          dialogEl.remove();
          resolve(true);
        }, 300);
      });
      
      cancelBtn.addEventListener('click', () => {
        this.closeModal(dialogEl);
        setTimeout(() => {
          dialogEl.remove();
          resolve(false);
        }, 300);
      });
      
      // 点击背景关闭
      dialogEl.addEventListener('click', (e) => {
        if (e.target === dialogEl) {
          this.closeModal(dialogEl);
          setTimeout(() => {
            dialogEl.remove();
            resolve(false);
          }, 300);
        }
      });
    });
  }
};

// 页面加载后初始化模态框控制
document.addEventListener('DOMContentLoaded', function() {
  ModalController.init();
});

// 导出模态框控制器
window.ModalController = ModalController;
