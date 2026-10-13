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
});
