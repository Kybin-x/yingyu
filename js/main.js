// JavaScript Document
/* ===== js/main.js ===== */

// ========== 学习进度管理 ==========
const ProgressManager = {
  KEY: 'english_study_progress',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  // 标记某章某考点完成
  setSection(chapterId, sectionId, done) {
    const data = this.getAll();
    if (!data[chapterId]) data[chapterId] = {};
    data[chapterId][sectionId] = done;
    this.save(data);
  },

  // 获取某章某考点是否完成
  getSection(chapterId, sectionId) {
    const data = this.getAll();
    return data[chapterId] && data[chapterId][sectionId] === true;
  },

  // 获取某章完成的考点数
  getChapterDoneCount(chapterId, totalSections) {
    const data = this.getAll();
    if (!data[chapterId]) return 0;
    let count = 0;
    for (let i = 1; i <= totalSections; i++) {
      if (data[chapterId]['section' + i] === true) count++;
    }
    return count;
  },

  // 获取总进度百分比
  getTotalProgress(chapterConfig) {
    let done = 0, total = 0;
    chapterConfig.forEach(ch => {
      total += ch.sections;
      done += this.getChapterDoneCount(ch.id, ch.sections);
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  },

  // 获取某章进度百分比
  getChapterProgress(chapterId, totalSections) {
    if (totalSections === 0) return 0;
    const done = this.getChapterDoneCount(chapterId, totalSections);
    return Math.round((done / totalSections) * 100);
  },

  // 重置所有进度
  resetAll() {
    localStorage.removeItem(this.KEY);
  }
};

// ========== 章节配置 ==========
const CHAPTERS = [
  { id: 'ch1',  num: 1,  title: '语音',             emoji: '🔊', sections: 3, file: 'chapter1.html' },
  { id: 'ch2',  num: 2,  title: '词汇',             emoji: '📝', sections: 3, file: 'chapter2.html' },
  { id: 'ch3',  num: 3,  title: '名词',             emoji: '📦', sections: 4, file: 'chapter3.html' },
  { id: 'ch4',  num: 4,  title: '代词',             emoji: '👆', sections: 4, file: 'chapter4.html' },
  { id: 'ch5',  num: 5,  title: '介词和冠词',       emoji: '🔗', sections: 4, file: 'chapter5.html' },
  { id: 'ch6',  num: 6,  title: '连词和数词',       emoji: '🔢', sections: 3, file: 'chapter6.html' },
  { id: 'ch7',  num: 7,  title: '形容词和副词',     emoji: '🌈', sections: 4, file: 'chapter7.html' },
  { id: 'ch8',  num: 8,  title: '动词',             emoji: '🏃', sections: 5, file: 'chapter8.html' },
  { id: 'ch9',  num: 9,  title: '简单句',           emoji: '💬', sections: 3, file: 'chapter9.html' },
  { id: 'ch10', num: 10, title: '复合句',           emoji: '🧩', sections: 4, file: 'chapter10.html' },
  { id: 'ch11', num: 11, title: '特殊句式',         emoji: '⚡', sections: 4, file: 'chapter11.html' },
  { id: 'ch12', num: 12, title: '虚拟语气与主谓一致', emoji: '🎯', sections: 4, file: 'chapter12.html' },
  { id: 'ch13', num: 13, title: '完形填空',         emoji: '🧠', sections: 3, file: 'chapter13.html' },
  { id: 'ch14', num: 14, title: '阅读理解',         emoji: '📖', sections: 3, file: 'chapter14.html' },
  { id: 'ch15', num: 15, title: '英汉互译',         emoji: '🔄', sections: 3, file: 'chapter15.html' },
  { id: 'ch16', num: 16, title: '短文改错',         emoji: '✏️', sections: 3, file: 'chapter16.html' },
  { id: 'ch17', num: 17, title: '书面表达',         emoji: '✍️', sections: 3, file: 'chapter17.html' },
  { id: 'ch18', num: 18, title: '情景交际',         emoji: '🗣️', sections: 3, file: 'chapter18.html' }
];

// ========== DOM 加载完成 ==========
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initBackToTop();
  initSectionToggles();
  initAnswerButtons();
  initProgressChecks();
  updateProgressUI();
});

// ========== 导航栏滚动效果 ==========
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 汉堡菜单
  const hamburger = document.querySelector('.hamburger');
  const navActions = document.querySelector('.nav-actions');
  if (hamburger && navActions) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navActions.classList.toggle('mobile-open');
    });

    // 点击菜单项后关闭
    navActions.querySelectorAll('a, button').forEach(item => {
      item.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navActions.classList.remove('mobile-open');
      });
    });
  }
}

// ========== 返回顶部 ==========
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========== 考点折叠/展开 ==========
function initSectionToggles() {
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', function () {
      const body = this.nextElementSibling;
      const toggle = this.querySelector('.section-toggle');

      if (body && body.classList.contains('section-body')) {
        body.classList.toggle('open');
        if (toggle) toggle.classList.toggle('open');
      }
    });
  });

  // 默认展开第一个
  const firstBody = document.querySelector('.section-body');
  const firstToggle = document.querySelector('.section-toggle');
  if (firstBody) firstBody.classList.add('open');
  if (firstToggle) firstToggle.classList.add('open');
}

// ========== 显示答案按钮 ==========
function initAnswerButtons() {
  document.querySelectorAll('.show-answer-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      if (answer && answer.classList.contains('answer-content')) {
        answer.classList.toggle('show');
        if (answer.classList.contains('show')) {
          this.innerHTML = '🙈 隐藏答案';
        } else {
          this.innerHTML = '👀 显示答案';
        }
      }
    });
  });
}

// ========== 学习完成勾选 ==========
function initProgressChecks() {
  document.querySelectorAll('.complete-check input[type="checkbox"]').forEach(cb => {
    const chapterId = cb.dataset.chapter;
    const sectionId = cb.dataset.section;

    if (chapterId && sectionId) {
      // 恢复状态
      cb.checked = ProgressManager.getSection(chapterId, sectionId);

      cb.addEventListener('change', function () {
        ProgressManager.setSection(chapterId, sectionId, this.checked);
        updateProgressUI();
        if (this.checked) {
          showConfetti(this);
        }
      });
    }
  });
}

// ========== 更新进度UI ==========
function updateProgressUI() {
  // 更新首页总进度条
  const totalBar = document.querySelector('.progress-bar-fill');
  const totalText = document.querySelector('.progress-text');
  if (totalBar && totalText) {
    const percent = ProgressManager.getTotalProgress(CHAPTERS);
    totalBar.style.width = percent + '%';
    totalText.textContent = '已完成 ' + percent + '%';
  }

  // 更新首页各章节卡片进度
  CHAPTERS.forEach(ch => {
    const card = document.querySelector('[data-chapter-id="' + ch.id + '"]');
    if (card) {
      const percent = ProgressManager.getChapterProgress(ch.id, ch.sections);
      const fill = card.querySelector('.card-progress-fill');
      const text = card.querySelector('.card-progress-text');
      const badge = card.querySelector('.card-badge');

      if (fill) fill.style.width = percent + '%';
      if (text) text.textContent = percent + '%';
      if (badge) {
        if (percent === 100) {
          badge.className = 'card-badge badge-done';
          badge.textContent = '✅ 已完成';
        } else if (percent > 0) {
          badge.className = 'card-badge badge-inprogress';
          badge.textContent = '📖 学习中';
        } else {
          badge.className = 'card-badge';
          badge.textContent = '';
        }
      }
    }
  });

  // 更新导航栏进度徽章
  const navBadge = document.querySelector('.progress-badge .badge-text');
  if (navBadge) {
    const percent = ProgressManager.getTotalProgress(CHAPTERS);
    navBadge.textContent = percent + '%';
  }
}

// ========== 完成时的小庆祝动画 ==========
function showConfetti(element) {
  const emojis = ['🎉', '⭐', '✨', '🌟', '💪', '👏'];
  const rect = element.getBoundingClientRect();

  for (let i = 0; i < 6; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.cssText = `
      position: fixed;
      left: ${rect.left + Math.random() * 40 - 20}px;
      top: ${rect.top}px;
      font-size: ${16 + Math.random() * 12}px;
      pointer-events: none;
      z-index: 9999;
      transition: all 1s ease-out;
      opacity: 1;
    `;
    document.body.appendChild(span);

    requestAnimationFrame(() => {
      span.style.transform = `translate(${Math.random() * 80 - 40}px, ${-60 - Math.random() * 60}px) rotate(${Math.random() * 360}deg)`;
      span.style.opacity = '0';
    });

    setTimeout(() => span.remove(), 1200);
  }
}

// ========== 重置进度（可在控制台调用） ==========
function resetProgress() {
  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
    ProgressManager.resetAll();
    location.reload();
  }
}