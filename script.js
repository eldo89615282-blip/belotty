/**
 * Belotty SB-79 Landing Page Interactive Scripts
 * Handles animations, navbar behavior, counter animations, purchase selection, and full detail view.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Animations (IntersectionObserver)
  const animatedElements = document.querySelectorAll('[data-animate]');

  // Immediately make hero section visible
  const heroElements = document.querySelectorAll('#hero [data-animate]');
  heroElements.forEach(el => el.classList.add('visible'));

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const animateObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Trigger number counter if inside this element
          const counters = entry.target.querySelectorAll('.stat-number');
          counters.forEach(counter => animateCounter(counter));
          
          // If the target itself is a counter
          if (entry.target.classList.contains('stat-number')) {
            animateCounter(entry.target);
          }

          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      // If already has visible class (hero), skip
      if (!el.classList.contains('visible')) {
        animateObserver.observe(el);
      }
    });
  } else {
    // Fallback: show all elements if IntersectionObserver is not supported
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // 2. Number Counter Animation
  function animateCounter(counterEl) {
    if (counterEl.dataset.counted === 'true') return;
    const target = parseInt(counterEl.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    counterEl.dataset.counted = 'true';
    const duration = 1600; // ms
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      counterEl.textContent = current.toLocaleString('ko-KR');

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counterEl.textContent = target.toLocaleString('ko-KR');
      }
    }

    requestAnimationFrame(updateCount);
  }

  // 3. Navbar Sticky & Background on Scroll
  const navbar = document.getElementById('nav-main');
  const stickyBuyBar = document.getElementById('sticky-buy-bar');
  const heroSection = document.getElementById('hero');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar shadow
    if (navbar) {
      if (scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Sticky Buy Bar on Mobile / Desktop
    if (stickyBuyBar && heroSection) {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      if (scrollY > heroBottom - 200) {
        stickyBuyBar.classList.add('visible');
      } else {
        stickyBuyBar.classList.remove('visible');
      }
    }
  }, { passive: true });

  // 4. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active', isActive);
      mobileToggle.setAttribute('aria-expanded', isActive.toString());
      mobileMenu.setAttribute('aria-hidden', (!isActive).toString());
    });

    // Close mobile menu on clicking any link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // 5. Purchase Options Selector
  const purchaseCards = document.querySelectorAll('.purchase-card');
  const stickyPriceCurrent = document.querySelector('.sticky-current');
  const stickyPriceOriginal = document.querySelector('.sticky-original');

  const pricingData = {
    single: {
      name: '1개 구매',
      current: '12,900원',
      original: '19,800원'
    },
    double: {
      name: '2개 세트 (10% 추가 할인)',
      current: '23,220원',
      original: '39,600원'
    },
    family: {
      name: '3개 세트 (15% 추가 할인)',
      current: '32,895원',
      original: '59,400원'
    }
  };

  let selectedOption = 'double'; // Default to best seller

  purchaseCards.forEach(card => {
    card.addEventListener('click', (e) => {
      purchaseCards.forEach(c => c.classList.remove('purchase-card-best'));
      card.classList.add('purchase-card-best');

      const buyBtn = card.querySelector('.btn-purchase');
      const productType = buyBtn ? buyBtn.getAttribute('data-product') : 'double';
      selectedOption = productType;

      if (pricingData[productType]) {
        if (stickyPriceCurrent) stickyPriceCurrent.textContent = pricingData[productType].current;
        if (stickyPriceOriginal) stickyPriceOriginal.textContent = pricingData[productType].original;
      }
    });
  });

  // Purchase Button Clicks (Toast Feedback)
  const buyButtons = document.querySelectorAll('.btn-purchase, #btn-sticky-buy, #hero-buy-btn, #nav-buy-btn');
  buyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.getAttribute('href') === '#buy') {
        // Just smooth scroll to buy section
        return;
      }
      e.preventDefault();
      const product = pricingData[selectedOption] || pricingData.single;
      showToast(`🛒 [${product.name}] ${product.current} 주문서가 작성되었습니다! 결제 단계로 이동합니다.`);
    });
  });

  // Easy Pay Buttons (Naver / Kakao)
  const naverPayBtn = document.getElementById('btn-naver-pay');
  const kakaoPayBtn = document.getElementById('btn-kakao-pay');

  if (naverPayBtn) {
    naverPayBtn.addEventListener('click', () => {
      const product = pricingData[selectedOption] || pricingData.single;
      showToast(`🟢 네이버페이 안전 결제창으로 연결됩니다. (${product.name} - ${product.current})`);
    });
  }

  if (kakaoPayBtn) {
    kakaoPayBtn.addEventListener('click', () => {
      const product = pricingData[selectedOption] || pricingData.single;
      showToast(`🟡 카카오페이 1초 간편 결제로 연결됩니다. (${product.name} - ${product.current})`);
    });
  }

  // Toast Notification Helper
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(27, 67, 50, 0.95);
        color: #fff;
        padding: 14px 24px;
        border-radius: 9999px;
        font-size: 0.9375rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-align: center;
        max-width: 90vw;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

  // 6. Full Detail Page Viewer Toggle
  const detailToggleBtn = document.getElementById('btn-toggle-full-detail');
  const detailViewer = document.getElementById('full-detail-viewer');
  if (detailToggleBtn && detailViewer) {
    detailToggleBtn.addEventListener('click', () => {
      const isExpanded = detailViewer.classList.toggle('expanded');
      detailToggleBtn.textContent = isExpanded ? '상세페이지 접기 ▲' : '제품 상세페이지 전체보기 ▼';
      if (isExpanded) {
        detailViewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // 7. Inquiry Form Handling
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      const nameInput = document.getElementById('inquiry-name');
      const phoneInput = document.getElementById('inquiry-phone');
      const emailInput = document.getElementById('inquiry-email');
      const typeSelect = document.getElementById('inquiry-type');
      const titleInput = document.getElementById('inquiry-title');
      const messageInput = document.getElementById('inquiry-message');
      const privacyCheck = document.getElementById('inquiry-privacy');

      function checkField(input, errorId, condition) {
        const errorEl = document.getElementById(errorId);
        if (!condition) {
          input.classList.add('is-invalid');
          if (errorEl) errorEl.classList.add('visible');
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
          if (errorEl) errorEl.classList.remove('visible');
        }
      }

      checkField(nameInput, 'error-name', nameInput.value.trim().length >= 2);
      checkField(phoneInput, 'error-phone', phoneInput.value.trim().length >= 8);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      checkField(emailInput, 'error-email', emailRegex.test(emailInput.value.trim()));

      checkField(typeSelect, 'error-type', typeSelect.value !== '');
      checkField(titleInput, 'error-title', titleInput.value.trim().length >= 2);
      checkField(messageInput, 'error-message', messageInput.value.trim().length >= 5);

      const privacyError = document.getElementById('error-privacy');
      if (!privacyCheck.checked) {
        if (privacyError) privacyError.classList.add('visible');
        isValid = false;
      } else {
        if (privacyError) privacyError.classList.remove('visible');
      }

      if (isValid) {
        const submitBtn = document.getElementById('btn-submit-inquiry');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>접수 중...</span>`;

        setTimeout(() => {
          showToast(`✅ [${nameInput.value.trim()}] 님의 문의가 성공적으로 접수되었습니다. 신속히 답변드리겠습니다!`);

          // Prepend new Q&A item to the board
          const qnaList = document.getElementById('qna-accordion-list');
          if (qnaList) {
            const newItem = document.createElement('div');
            const isSecret = document.getElementById('inquiry-secret')?.checked;
            newItem.className = 'qna-item open';
            newItem.setAttribute('data-category', typeSelect.value || 'product');
            newItem.innerHTML = `
              <button class="qna-item-header" aria-expanded="true">
                <div class="qna-item-badges">
                  <span class="qna-badge" style="background:#FFF3E0;color:#E65100;">답변대기</span>
                  <span class="qna-cat-tag">${typeSelect.options[typeSelect.selectedIndex].text}</span>
                  ${isSecret ? '<span class="qna-badge qna-badge-secret">비밀글 🔒</span>' : ''}
                </div>
                <div class="qna-item-title-wrap">
                  <span class="qna-title">${escapeHtml(titleInput.value.trim())}</span>
                </div>
                <div class="qna-item-meta">
                  <span class="qna-author">${nameInput.value.trim().substring(0, 1)}*${nameInput.value.trim().slice(-1)}</span>
                  <span class="qna-date">방금 전</span>
                  <svg class="qna-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </button>
              <div class="qna-item-body" style="display:block;">
                <div class="qna-reply-box">
                  <p class="qna-reply-text">
                    <strong>문의 내용:</strong><br>${escapeHtml(messageInput.value.trim())}<br><br>
                    <span style="color:var(--color-primary);font-weight:700;">벨로티 고객지원팀에 접수되었습니다. 확인 후 신속하게 연락드리겠습니다.</span>
                  </p>
                </div>
              </div>
            `;
            const newHeader = newItem.querySelector('.qna-item-header');
            newHeader.addEventListener('click', () => {
              const isOpen = newItem.classList.toggle('open');
              newHeader.setAttribute('aria-expanded', isOpen.toString());
              const body = newItem.querySelector('.qna-item-body');
              if (body) body.style.display = isOpen ? 'block' : 'none';
            });
            qnaList.insertBefore(newItem, qnaList.firstChild);
            newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          inquiryForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 700);
      }
    });

    // Real-time error removal
    inquiryForm.querySelectorAll('input, select, textarea').forEach(field => {
      const clearError = () => {
        field.classList.remove('is-invalid');
        const err = field.parentElement.querySelector('.field-error');
        if (err) err.classList.remove('visible');
      };
      field.addEventListener('input', clearError);
      field.addEventListener('change', clearError);
    });
  }

  // 8. Product Q&A Accordion & Filter Tabs Logic
  const qnaItems = document.querySelectorAll('.qna-item');
  qnaItems.forEach(item => {
    const header = item.querySelector('.qna-item-header');
    if (header) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        header.setAttribute('aria-expanded', isOpen.toString());
        const body = item.querySelector('.qna-item-body');
        if (body) body.style.display = isOpen ? 'block' : 'none';
      });
    }
  });

  const qnaTabs = document.querySelectorAll('.qna-tab');
  qnaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      qnaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-category');
      const allItems = document.querySelectorAll('.qna-item');
      allItems.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 9. 1:1 Live Chat Widget Logic
  const chatWidget = document.getElementById('chat-widget');
  const chatTriggerBtn = document.getElementById('chat-trigger-btn');
  const chatCloseBtn = document.getElementById('chat-close-btn');
  const chatWindow = document.getElementById('chat-window');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatTyping = document.getElementById('chat-typing-indicator');
  const quickChips = document.querySelectorAll('.quick-chip');
  const chatInitTime = document.getElementById('chat-init-time');

  function getCurrentTimeString() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${ampm} ${hours}:${minutes}`;
  }

  if (chatInitTime) {
    chatInitTime.textContent = getCurrentTimeString();
  }

  function openChatWindow() {
    if (!chatWidget) return;
    chatWidget.classList.add('active');
    if (chatTriggerBtn) chatTriggerBtn.setAttribute('aria-expanded', 'true');
    if (chatWindow) chatWindow.setAttribute('aria-hidden', 'false');
    if (chatInput) {
      setTimeout(() => chatInput.focus(), 250);
      scrollChatToBottom();
    }
  }

  function closeChatWindow() {
    if (!chatWidget) return;
    chatWidget.classList.remove('active');
    if (chatTriggerBtn) chatTriggerBtn.setAttribute('aria-expanded', 'false');
    if (chatWindow) chatWindow.setAttribute('aria-hidden', 'true');
  }

  // Toggle chat window open / close
  if (chatTriggerBtn && chatWidget) {
    chatTriggerBtn.addEventListener('click', () => {
      const isActive = chatWidget.classList.toggle('active');
      chatTriggerBtn.setAttribute('aria-expanded', isActive.toString());
      if (chatWindow) chatWindow.setAttribute('aria-hidden', (!isActive).toString());

      if (isActive && chatInput) {
        setTimeout(() => chatInput.focus(), 250);
        scrollChatToBottom();
      }
    });
  }

  // All open chat triggers
  const openChatBtns = document.querySelectorAll('.btn-open-chat');
  openChatBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openChatWindow();
    });
  });

  if (chatCloseBtn && chatWidget) {
    chatCloseBtn.addEventListener('click', closeChatWindow);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWidget && chatWidget.classList.contains('active')) {
      closeChatWindow();
    }
  });

  // Scroll messages to bottom
  function scrollChatToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Append a message to the chat
  function appendMessage(text, isUser = false) {
    if (!chatMessages) return;

    const timeStr = getCurrentTimeString();
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-agent'}`;

    if (isUser) {
      msgDiv.innerHTML = `
        <div class="msg-content">
          <div class="msg-bubble">${escapeHtml(text)}</div>
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="msg-avatar">B</div>
        <div class="msg-content">
          <div class="msg-bubble">${text}</div>
          <span class="msg-time">${timeStr}</span>
        </div>
      `;
    }

    if (chatTyping && chatTyping.parentNode === chatMessages) {
      chatMessages.insertBefore(msgDiv, chatTyping);
    } else {
      chatMessages.appendChild(msgDiv);
    }

    scrollChatToBottom();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Smart simulated replies based on keywords
  function getBotReply(userMsg) {
    const msg = userMsg.toLowerCase();

    if (msg.includes('카톡') || msg.includes('카카오') || msg.includes('오픈') || msg.includes('상담원') || msg.includes('연결') || msg.includes('사람') || msg.includes('실시간')) {
      return `💬 <strong>벨로티 공식 카카오톡 1:1 오픈채팅:</strong><br><br>
아래 버튼을 터치하시면 카카오톡에서 전담 상담원과 실시간 1:1 대화가 바로 연결됩니다!<br><br>
👉 <a href="https://open.kakao.com/o/slppScSi" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:8px 16px;background:#FEE500;color:#3C1E1E;font-weight:800;border-radius:20px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,0.15);">🟡 카카오톡 1:1 오픈채팅 바로가기 &rarr;</a>`;
    }

    if (msg.includes('사용') || msg.includes('방법') || msg.includes('팁') || msg.includes('어떻게')) {
      return `💡 <strong>벨로티 SB-79 샴푸브러시 사용법:</strong><br><br>
1. 모발을 미온수로 충분히 적신 후 샴푸 거품을 냅니다.<br>
2. 브러시를 손가락 사이에 편안하게 끼우고 두피에 가볍게 밀착시킵니다.<br>
3. 원을 그리듯 부드럽게 롤링하며 마사지합니다.<br>
4. <strong>뒷목과 승모근까지</strong> 쓸어내리듯 브러싱해주시면 뭉친 피로가 개운하게 풀립니다 ✨`;
    }

    if (msg.includes('배송') || msg.includes('언제') || msg.includes('출고') || msg.includes('도착')) {
      return `🚚 <strong>배송 안내:</strong><br><br>
평일 <strong>오후 2시 이전 주문 시 당일 출고</strong>됩니다!<br>
전 상품 <strong>무료배송</strong>(도서산간 포함)이며, 일반적으로 출고 익일 안전하게 받아보실 수 있습니다.`;
    }

    if (msg.includes('할인') || msg.includes('세트') || msg.includes('가격') || msg.includes('얼마')) {
      return `🎁 <strong>할인 혜택 안내:</strong><br><br>
현재 런칭 특가 진행 중입니다!<br>
• 1개 구매: <strong>12,900원</strong> (35% OFF)<br>
• 2개 세트: <strong>23,220원</strong> (10% 추가 할인 🔥 BEST)<br>
• 3개 세트: <strong>32,895원</strong> (15% 추가 할인)<br><br>
가족이나 지인 선물용으로 2~3개 세트 주문이 가장 많습니다!`;
    }

    if (msg.includes('대량') || msg.includes('oem') || msg.includes('b2b') || msg.includes('납품') || msg.includes('도매')) {
      return `🏢 <strong>대량 구매 & OEM 제조 안내:</strong><br><br>
(주)벨로티는 40년 전통의 자체 국내 생산 공장을 보유하고 있어 기업 맞춤 대량 납품 및 로고 인쇄(OEM/ODM)가 가능합니다.<br><br>
카카오톡 1:1 오픈채팅(<a href="https://open.kakao.com/o/slppScSi" target="_blank" style="color:var(--color-primary);font-weight:800;text-decoration:underline;">바로가기</a>) 또는 유선전화(<strong>070-4175-9582</strong>)로 문의주시면 전담 팀이 빠른 견적서를 보내드립니다!`;
    }

    if (msg.includes('소재') || msg.includes('실리콘') || msg.includes('아파') || msg.includes('자극') || msg.includes('두피')) {
      return `🌿 <strong>소재 및 저자극 설계 안내:</strong><br><br>
벨로티 SB-79는 딱딱한 플라스틱이나 일반 실리콘과 달리, <strong>피부 친화적 엘라스토머(Elastomer)</strong> 소재로 제작되었습니다.<br><br>
피부 자극 테스트를 완료하여 매일 샤워 시 사용하셔도 두피에 자극이나 상처가 전혀 없습니다.`;
    }

    if (msg.includes('안녕') || msg.includes('반가') || msg.includes('하이')) {
      return `반갑습니다! 벨로티 1:1 상담원입니다 😊<br><br>SB-79 샴푸브러시 구매 및 제품에 대해 궁금하신 점을 말씀해주시면 바로 도와드리겠습니다!<br><br>카카오톡으로 대화를 원하시면 <a href="https://open.kakao.com/o/slppScSi" target="_blank" style="color:#E65100;font-weight:800;text-decoration:underline;">[카톡 1:1 오픈채팅]</a>을 클릭해주세요.`;
    }

    return `소중한 문의 감사합니다! 🙏<br><br>
더욱 빠른 1:1 실시간 대화를 원하시면 <a href="https://open.kakao.com/o/slppScSi" target="_blank" rel="noopener noreferrer" style="color:#E65100;font-weight:800;text-decoration:underline;">카카오톡 1:1 오픈채팅</a>으로 연결하시거나 유선 고객센터(<strong>070-4175-9582</strong>)로 연락주시면 상세히 안내해 드리겠습니다.`;
  }

  function handleSendMessage(messageText) {
    if (!messageText || !messageText.trim()) return;

    appendMessage(messageText.trim(), true);

    if (chatTyping) {
      chatTyping.style.display = 'flex';
      scrollChatToBottom();
    }

    const quickReplies = document.getElementById('chat-quick-replies');
    if (quickReplies) {
      quickReplies.style.display = 'none';
    }

    const replyDelay = Math.floor(Math.random() * 300) + 600;
    setTimeout(() => {
      if (chatTyping) {
        chatTyping.style.display = 'none';
      }
      const reply = getBotReply(messageText);
      appendMessage(reply, false);
    }, replyDelay);
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value;
      chatInput.value = '';
      handleSendMessage(text);
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.tagName === 'A') return; // let links navigate
      const msg = chip.getAttribute('data-msg') || chip.textContent;
      handleSendMessage(msg);
    });
  });
});
