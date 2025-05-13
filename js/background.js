/**
 * Booka乐读 BP - 背景效果控制器
 * 处理各种高级背景效果的初始化和管理
 */

// 背景系统主控制器
const BackgroundController = {
  
  // 初始化所有背景效果
  init: function() {
    this.initParticles();
    this.createDataStreams();
    this.createPulseRings();
    this.createDigitalRain();
    this.createLightFlares();
    this.initPerformanceMode();
    
    // 为背景添加轻微视差效果
    this.initParallaxEffect();
  },
  
  // 初始化粒子系统
  initParticles: function() {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { value: 40, density: { enable: true, value_area: 800 } },
          color: { value: "#ffd600" },
          shape: { type: "circle" },
          opacity: { 
            value: 0.5, 
            random: true, 
            anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } 
          },
          size: { 
            value: 2, 
            random: true, 
            anim: { enable: true, speed: 2, size_min: 0.3, sync: false } 
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffd600",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 1.2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "bubble" },
            onclick: { enable: true, mode: "push" },
            resize: true
          },
          modes: {
            bubble: { distance: 150, size: 4, duration: 2, opacity: 0.8, speed: 3 },
            push: { particles_nb: 4 }
          }
        },
        retina_detect: true
      });
    } else {
      console.warn('particles.js not loaded');
    }
  },
  
  // 创建数据流效果
  createDataStreams: function() {
    const container = document.querySelector('.data-streams');
    if (!container) return;
    
    // 清除现有数据流
    container.innerHTML = '';
    
    // 创建新数据流
    const streamCount = this.isMobile() ? 3 : 5;
    for (let i = 0; i < streamCount; i++) {
      const stream = document.createElement('div');
      stream.className = 'data-stream';
      
      // 随机位置与宽度
      const top = 15 + Math.random() * 70; // 15-85%的高度范围
      const width = 40 + Math.random() * 50; // 40-90%的宽度范围
      const delay = Math.random() * 7; // 0-7s的延迟
      
      stream.style.top = `${top}%`;
      stream.style.width = `${width}%`;
      stream.style.animationDelay = `${delay}s`;
      
      container.appendChild(stream);
    }
  },
  
  // 创建脉冲圆环效果
  createPulseRings: function() {
    const container = document.createElement('div');
    container.className = 'pulse-rings';
    document.getElementById('background-container').appendChild(container);
    
    const ringCount = this.isMobile() ? 2 : 3;
    for (let i = 0; i < ringCount; i++) {
      const ring = document.createElement('div');
      ring.className = 'pulse-ring';
      
      // 随机位置
      const top = 20 + Math.random() * 60; // 20-80%的高度范围
      const left = 20 + Math.random() * 60; // 20-80%的宽度范围
      const delay = i * 2; // 间隔2秒
      
      ring.style.top = `${top}%`;
      ring.style.left = `${left}%`;
      ring.style.animationDelay = `${delay}s`;
      
      container.appendChild(ring);
    }
    
    // 定期刷新脉冲圆环位置
    setInterval(() => {
      const rings = document.querySelectorAll('.pulse-ring');
      rings.forEach(ring => {
        const top = 20 + Math.random() * 60;
        const left = 20 + Math.random() * 60;
        
        ring.style.top = `${top}%`;
        ring.style.left = `${left}%`;
      });
    }, 18000); // 18秒刷新一次位置
  },
  
  // 创建数字雨效果
  createDigitalRain: function() {
    const container = document.querySelector('.digital-rain');
    if (!container) {
      const rainContainer = document.createElement('div');
      rainContainer.className = 'digital-rain';
      document.getElementById('background-container').appendChild(rainContainer);
      
      this.generateDigitalRain(rainContainer);
    } else {
      this.generateDigitalRain(container);
    }
  },
  
  // 生成数字雨内容
  generateDigitalRain: function(container) {
    container.innerHTML = '';
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789アイウエオカキクケコサシスセソタチツテトBOOKA乐读AI';
    const columnCount = this.isMobile() ? 10 : 20;
    
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div');
      column.className = 'rain-column';
      column.style.left = `${(i / columnCount) * 100}%`;
      
      // 随机速度和延迟
      const speed = 5 + Math.random() * 10;
      const delay = Math.random() * 8;
      column.style.animationDuration = `${speed}s`;
      column.style.animationDelay = `-${delay}s`;
      
      // 生成随机字符
      let rainText = '';
      const length = 10 + Math.floor(Math.random() * 15);
      for (let j = 0; j < length; j++) {
        rainText += characters.charAt(Math.floor(Math.random() * characters.length));
        if (j < length - 1) rainText += '<br>';
      }
      
      column.innerHTML = rainText;
      container.appendChild(column);
    }
  },
  
  // 创建光斑效果
  createLightFlares: function() {
    const container = document.querySelector('.light-flares');
    if (!container) {
      const flaresContainer = document.createElement('div');
      flaresContainer.className = 'light-flares';
      document.getElementById('background-container').appendChild(flaresContainer);
      
      // 添加光斑
      const flareCount = this.isMobile() ? 2 : 3;
      for (let i = 0; i < flareCount; i++) {
        const flare = document.createElement('div');
        flare.className = `flare flare-${i+1}`;
        flaresContainer.appendChild(flare);
      }
    }
  },
  
  // 初始化视差效果
  initParallaxEffect: function() {
    if (this.isMobile()) return; // 移动设备上禁用视差效果
    
    document.addEventListener('mousemove', (e) => {
      const pageX = e.clientX;
      const pageY = e.clientY;
      
      // 计算相对位置（-1到1）
      const relX = (pageX - window.innerWidth / 2) / (window.innerWidth / 2);
      const relY = (pageY - window.innerHeight / 2) / (window.innerHeight / 2);
      
      // 应用光斑视差
      const flares = document.querySelectorAll('.flare');
      flares.forEach((flare, index) => {
        const depth = 0.05 + (index * 0.01); // 不同深度
        flare.style.transform = `translate(${relX * 30 * depth}px, ${relY * 30 * depth}px)`;
      });
      
      // 应用网格视差
      const grid = document.querySelector('.cyber-grid');
      if (grid) {
        grid.style.transform = `perspective(1000px) rotateX(${60 + relY * 2}deg) rotateZ(${45 + relX * 2}deg)`;
      }
    });
  },
  
  // 初始化性能模式
  initPerformanceMode: function() {
    // 检测低端设备
    const isLowEndDevice = () => {
      const isLowRAM = navigator.deviceMemory && navigator.deviceMemory < 4;
      const isSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      return isLowRAM || isSlowCPU || this.isMobile();
    };
    
    // 如果是低端设备，激活低性能模式
    if (isLowEndDevice()) {
      document.body.classList.add('low-performance');
      
      // 降低粒子数量
      if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
          particles: {
            number: { value: 20 },
            opacity: { value: 0.3 },
            size: { value: 1.5 },
            line_linked: { opacity: 0.1 }
          }
        });
      }
    }
  },
  
  // 检测是否为移动设备
  isMobile: function() {
    return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
};

// 页面加载后初始化背景效果
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('background-container')) {
    BackgroundController.init();
  }
});

// 窗口大小改变时重新调整背景效果
window.addEventListener('resize', function() {
  BackgroundController.createDataStreams();
  BackgroundController.createDigitalRain();
});
