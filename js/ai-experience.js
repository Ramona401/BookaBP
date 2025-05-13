/**
 * Booka乐读 BP - AI体验功能控制器
 * 专门处理AI阅读教练体验弹窗
 */

const AIExperienceController = {
  
  // 状态记录
  state: {
    isModalOpen: false,
    modalElement: null
  },
  
  // 初始化控制器
  init: function() {
    // 监听页面加载事件
    document.addEventListener('DOMContentLoaded', () => {
      this.createModalContainer();
    });
    
    // 监听模态设置事件，便于在页面加载后初始化按钮
    document.addEventListener('modal:setupCardHandlers', () => {
      this.setupAIButtons();
    });
    
    // 每个新页面加载完成后重新初始化按钮
    document.addEventListener('modal:opened', (event) => {
      setTimeout(() => {
        this.setupAIButtons();
      }, 500); // 延迟执行，确保DOM已更新
    });
  },
  
  // 创建模态框容器（如果不存在）
  createModalContainer: function() {
    // 检查是否已存在AI体验模态框容器
    let container = document.getElementById('ai-experience-container');
    if (!container) {
      // 创建并添加到文档
      container = document.createElement('div');
      container.id = 'ai-experience-container';
      container.className = 'ai-modal-overlay';
      
      // 默认模态框HTML结构
      container.innerHTML = `
        <div class="ai-modal-content">
          <div class="ai-modal-header">
            <h2>AI阅读教练体验</h2>
            <button class="ai-modal-close">&times;</button>
          </div>
          <div class="ai-modal-body">
            <iframe id="ai-experience-iframe" src="about:blank" frameborder="0"></iframe>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);
      
      // 保存引用
      this.state.modalElement = container;
      
      // 设置关闭按钮事件
      const closeBtn = container.querySelector('.ai-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeModal();
        });
      }
      
      // 设置点击背景关闭
      container.addEventListener('click', (e) => {
        if (e.target === container) {
          this.closeModal();
        }
      });
      
      // 设置ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.isModalOpen) {
          this.closeModal();
        }
      });
      
      // 添加CSS样式
      this.addStyles();
    }
  },
  
  // 设置AI体验按钮
  setupAIButtons: function() {
    console.log('设置AI体验按钮...');
    
    // 查找所有可能的AI体验按钮
    const buttons = [
      ...document.querySelectorAll('[id^="try-ai-coach"]'),
      ...document.querySelectorAll('.ai-demo-button'),
      ...document.querySelectorAll('[data-ai-experience]')
    ];
    
    if (buttons.length > 0) {
      console.log(`找到${buttons.length}个AI体验按钮`);
    } else {
      console.log('未找到AI体验按钮');
      return;
    }
    
    buttons.forEach((button, index) => {
      console.log(`处理按钮 #${index+1}:`, button);
      
      // 克隆按钮以移除现有事件监听器
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
      
      // 添加新的点击事件
      newButton.addEventListener('click', (e) => {
        console.log('AI体验按钮被点击');
        e.preventDefault();
        e.stopPropagation();
        this.openModal();
      });
    });
  },
  
  // 打开AI体验模态框
  openModal: function() {
    console.log('尝试打开AI体验模态框');
    
    // 确保模态框容器存在
    if (!this.state.modalElement) {
      this.createModalContainer();
    }
    
    // 设置iframe URL
    const iframe = document.getElementById('ai-experience-iframe');
    if (iframe) {
      iframe.src = 'https://www.xingyunlink.com/chat/share?shareId=1w81wudj9pqiq3u8z2ch78wb';
    }
    
    // 显示模态框
    this.state.modalElement.classList.add('active');
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
    this.state.isModalOpen = true;
    
    console.log('AI体验模态框已打开');
  },
  
  // 关闭模态框
  closeModal: function() {
    if (!this.state.modalElement) return;
    
    // 隐藏模态框
    this.state.modalElement.classList.remove('active');
    document.body.style.overflow = ''; // 恢复背景滚动
    this.state.isModalOpen = false;
    
    // 重置iframe
    const iframe = document.getElementById('ai-experience-iframe');
    if (iframe) {
      iframe.src = 'about:blank';
    }
    
    console.log('AI体验模态框已关闭');
  },
  
  // 添加必要的CSS样式
  addStyles: function() {
    // 检查样式是否已存在
    if (document.getElementById('ai-experience-styles')) return;
    
    // 创建样式元素
    const style = document.createElement('style');
    style.id = 'ai-experience-styles';
    
    // 样式内容
    style.textContent = `
      .ai-modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 2000;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      }
      
      .ai-modal-overlay.active {
        display: flex;
      }
      
      .ai-modal-content {
        width: 80%;
        height: 80%;
        background: var(--card-bg, rgba(3, 8, 18, 0.85));
        border: 1px solid var(--card-border, rgba(255, 214, 0, 0.3));
        border-radius: 15px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 30px rgba(255, 214, 0, 0.3);
        position: relative;
      }
      
      .ai-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid var(--card-border, rgba(255, 214, 0, 0.3));
      }
      
      .ai-modal-header h2 {
        margin: 0;
        color: var(--brand-yellow, #ffd600);
        font-size: 1.8rem;
      }
      
      .ai-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .ai-modal-close:hover {
        color: var(--brand-yellow, #ffd600);
        transform: rotate(90deg);
      }
      
      .ai-modal-body {
        flex: 1;
        padding: 0;
      }
      
      .ai-modal-body iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      
      @media (max-width: 768px) {
        .ai-modal-content {
          width: 95%;
          height: 90%;
        }
        
        .ai-modal-header h2 {
          font-size: 1.5rem;
        }
      }
    `;
    
    // 添加到文档头部
    document.head.appendChild(style);
  }
};

// 初始化AI体验控制器
AIExperienceController.init();

// 导出控制器
window.AIExperienceController = AIExperienceController;
