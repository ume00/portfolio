$(function () {
/* ========================================
  共通
======================================== */
  // 共通変数（jQueryキャッシュ）
  const $win = $(window);
  const $body = $('body');
  const $header = $('.header');

  // bfcache / 再読込時にスクロール位置を復元しない
  history.scrollRestoration = 'manual';

  /* メインカラー変更
====================================== */
  const THEME_KEY = 'theme';
  const THEME_SECONDARY = 'secondary';

  $('#colorToggle').on('change', function () {
    const isSecondary = $(this).is(':checked');

    // テーマ切り替え
    $body.toggleClass('theme-secondary', isSecondary);
    localStorage.setItem(THEME_KEY, isSecondary ? THEME_SECONDARY : 'pink');

    // 背景再初期化
    if (!prefersReducedMotion) {
      initBg();
    }
  });

  // ページ読み込み時にカラーを復元
  if (localStorage.getItem(THEME_KEY) === THEME_SECONDARY) {
    $('#colorToggle').prop('checked', true);
    $body.addClass('theme-secondary');
  }

  /* 背景
====================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let bgInstance = null;

  // 共通設定
  const bgBaseSet = {
    el: '.js-bg-anime-1',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    highlightColor: 0xfff1f6,
    midtoneColor: 0xf6dbe4,
    lowlightColor: 0xfefefe,
    baseColor: 0xffffff,
    blurFactor: 0.6,
    speed: 3.0,
    zoom: 0.6,
  };

  // カラー2
  const bgSecondarySet = {
    highlightColor: 0xfffbf0,
    midtoneColor: 0xf7e2a8,
    lowlightColor: 0xfefefe,
    blurFactor: 0.6,
    speed: 3.0,
    zoom: 0.6,
  };

  // 初期化
  function initBg() {
    const el = document.querySelector('.js-bg-anime-1');
    if (!el) return;

    if (bgInstance) {
      bgInstance.destroy();
      bgInstance = null;
    }

    const isSecondary = document.querySelector('.theme-secondary .js-bg-anime-1');

    bgInstance = VANTA.FOG(
      Object.assign({}, bgBaseSet, isSecondary ? bgSecondarySet : {})
    );
  }

  if (!prefersReducedMotion) {
    initBg();
  }

  /* カーソル追従エフェクト
====================================== */
  const $cursorFollow = $('.cursor-follow');
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  const CURSOR_DELAY = 0.12; // 遅延係数

  if (window.matchMedia('(hover: hover)').matches) {

    $(document).on('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      $cursorFollow.css('opacity', '1');
    });

    // マウスが画面外に出たときに非表示
    $body.on('mouseleave', () => $cursorFollow.css('opacity', '0'));
    // マウスが画面内に入ったときに表示
    $body.on('mouseenter', () => $cursorFollow.css('opacity', '1'));

    // スムーズに追従
    function animateCursor() {
      cursorX += (mouseX - cursorX) * CURSOR_DELAY;
      cursorY += (mouseY - cursorY) * CURSOR_DELAY;

      $cursorFollow.css({ left: cursorX + 'px', top: cursorY + 'px' });
      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // ホバー時のカーソル変化
    $('.js-hover, a, button, input, textarea')
      .on('mouseenter', () => $cursorFollow.addClass('is-cursor-hover'))
      .on('mouseleave', () => $cursorFollow.removeClass('is-cursor-hover'));
  }

  /* ハンバーガーメニュー
====================================== */
  $('.js-menu-toggle').on('click', () => $header.toggleClass('is-nav-open'));
  // ナビゲーションリンククリック時にメニューを閉じる
  $('.nav-link').on('click', () => $header.toggleClass('is-nav-open'));

  /* スムーススクロール
====================================== */
  const HEADER_HEIGHT = 72;

  /* アンカークリック
------------------------------------- */
$('a[href^="#"], a[href^="/#"]').on('click', function (e) {
  const href = $(this).attr('href');
  const isTopPage =
  location.pathname === '/' ||
  location.pathname === '/index.html';

  if (href.startsWith('/#')) {
    const hash = href.replace('/', '');

    // すでにトップページにいる場合、ページ内アンカーとして処理
    if (isTopPage) {
      const $target = $(hash);
      if (!$target.length) return;

      e.preventDefault();
      $('html, body').animate({
        scrollTop: $target.offset().top - HEADER_HEIGHT
      }, 300);
      return;
    }

    // トップ以外の場合、遷移してからスクロール
    e.preventDefault();
    sessionStorage.setItem('scrollTarget', hash);
    location.href = '/';
    return;
  }

  // 同一ページ内
  if (href.startsWith('#')) {
    const $target = $(href);
    if (!$target.length) return;

    e.preventDefault();
    $('html, body').animate({
      scrollTop: $target.offset().top - HEADER_HEIGHT
    }, 300);
  }
});

/* =========================
   ページ読み込み後処理
========================= */
$(window).on('load', function () {
  const isTopPage =
    location.pathname === '/' ||
    location.pathname === '/index.html';

  if (!isTopPage) return;

  const hash =
    sessionStorage.getItem('scrollTarget') ||
    location.hash;

  if (!hash) return;

  const $target = $(hash);
  if (!$target.length) return;

  // 自動アンカー対策
  $(window).scrollTop(0);

  $('html, body').animate({
    scrollTop: $target.offset().top - HEADER_HEIGHT
  }, 400);

  sessionStorage.removeItem('scrollTarget');
});

  /* 表示速度改善(will-change)
====================================== */
  document.querySelectorAll('.fade-in, .fade-in-2, .animate-float').forEach(el => {
    el.addEventListener('animationstart', () => el.style.willChange = 'transform, opacity');
    el.addEventListener('animationend', () => el.style.willChange = 'auto');
  });

  const modal = document.querySelector('.modal-inner');
  if (modal) {
    modal.addEventListener('transitionstart', () => modal.style.willChange = 'transform, opacity');
    modal.addEventListener('transitionend', () => modal.style.willChange = 'auto');
  }

  /* フェードイン
====================================== */
  const REVEAL_OFFSET = 150; // 数値を大きくすると早く出る
  let $fadeItems = $('.fade-in');

  function revealOnScroll() {
    const scrollPos = $win.scrollTop();
    const windowHeight = $win.height();

    $fadeItems = $fadeItems.filter(function () {
      const elemTop = $(this).offset().top;
      if (scrollPos > elemTop - windowHeight + REVEAL_OFFSET) {
        $(this).addClass('is-visible');
        return false;
      }
      return true;
    });
  }

  revealOnScroll();

  // 画像など完全読み込み後（途中リロード対策）
  $win.on('load', () => {
    requestAnimationFrame(revealOnScroll);
  
    /* 再読み込み時にTOPからスクロール
====================================== */
    window.scrollTo(0, 0);
  });

/* ========================================
  FV
======================================== */
  /* タイプライター
====================================== */
  const text = 'あなたの想いを、丁寧にかたちに';
  const $typewriter = $('.js-typewriter');
  let index = 0;
  let started = false;

  function type() {
    if (index >= text.length) return;
    $typewriter.text($typewriter.text() + text.charAt(index));
    index++;
    setTimeout(type, 160); // 1文字追加するスピード
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        // ページ読み込み後1秒待ってから開始
        setTimeout(type, 1000);
      }
    });
  }, { threshold: 0.3 });

  if ($typewriter.length) {
    observer.observe($typewriter[0]);
  }

/* ========================================
  skill
======================================== */
  /* 背景
====================================== */
  function updateCircle() {
    const $section = $('.com-bg-anime-2-panel');
    const $bg = $('.com-bg-anime-2');
    if (!$section.length || !$bg.length) return;

    const winH = $win.height(), winW = $win.width();
    const rect = $section[0].getBoundingClientRect();

    // 円の開始を50vh遅らせる
    const progress = (winH - rect.top - winH * 0.5) / (winH * 0.75);
    const clamped = Math.max(0, Math.min(1, progress));

    // 円の大きさを増やす
    let factor = 1.5;
    if (winH < 767) factor = 1.7;
    const diagonal = Math.sqrt(winW * winW + winH * winH);
    const size = clamped * diagonal * factor;

    $bg.css({ width: size + 'px', height: size + 'px' });

    // 下端が画面下端に到達したか判定 
    const offset = 100; // 100px手前で判定
    $section.toggleClass('is-hidden', rect.bottom <= winH + offset);
  }
  $win.on('load', function() {
  /* ========================================
    works
  ======================================== */
    /* 3D効果
  ====================================== */
    if (window.matchMedia('(hover: hover)').matches) {
      $('.js-3d')
        .on('mousemove', function (e) {
          const rect = this.getBoundingClientRect();
          const rotateX = (e.clientY - rect.top - rect.height / 2) / 30;
          const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 30;
          $(this).css({
            transform: `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          });
        })
        .on('mouseleave', function () {
          $(this).css({ transform: 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)' });
        });
    }
    /* モーダル
  ====================================== */
    $('.js-modal-button').on('click', function () {
      $('.js-modal').addClass('is-active');
      $body.css('overflow', 'hidden');
    });
    $('.modal-close, .modal-overlay').on('click', function () {
      $('.js-modal').removeClass('is-active');
      $body.css('overflow', '');
    });
  /* ========================================
    contact
  ======================================== */
    /* form
  ====================================== */
    const form = document.getElementById('contactForm');
    const completeMsg = document.querySelector('.form-success');
    const errorMsg = document.querySelector('.form-error');

    function resetMessages() {
      if (!form) return;
      form.classList.remove('is-success', 'is-failed');
      form.querySelectorAll('.form-item').forEach(item => item.classList.remove('is-error'));
      form.querySelectorAll('.is-form-error-note').forEach(el => el.remove());
    }

    if (form) {
      // bfcache / 再表示対策
      window.addEventListener('pageshow', resetMessages);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        resetMessages();
        let firstErrorItem = null;

        const showError = (input, message) => {
          const item = input.closest('.form-item');
          item.classList.add('is-error');
          const error = document.createElement('span');
          error.className = 'is-form-error-note';
          error.textContent = message;
          item.querySelector('.form-label').appendChild(error);
          if (!firstErrorItem) firstErrorItem = item;
        };

        // 必須チェック
        this.querySelectorAll('[required]').forEach(field => {
          if (!field.value.trim()) showError(field, '必須項目です。入力してください。');
        });

        // メール形式チェック
        const email = document.getElementById('email');
        if (email?.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(email.value)) showError(email, 'メールアドレスは正しい形式で入力してください。');
        }

        // 日本語チェック（ひらがな・カタカナ・漢字を1文字以上）
        const message = document.getElementById('message');
        if (message?.value.trim()) {
          const jpPattern = /[ぁ-んァ-ヶ一-龠]/;
          if (!jpPattern.test(message.value)) showError(message, '日本語を1文字以上含めて入力してください。');
        }

        // エラーがあればスクロール
        if (firstErrorItem) {
          const offset = window.innerHeight * 0.3;
          const rect = firstErrorItem.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({ top: rect.top + scrollTop - offset, behavior: 'smooth' });
          return;
        }

        // 送信処理
        sendForm()
          .then(() => {
            // 成功
            form.classList.add('is-success');
            completeMsg?.classList.add('is-visible');
            completeMsg?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          })
          .catch(() => {
            // 失敗
            form.classList.add('is-failed');
            errorMsg?.classList.add('is-visible');
            errorMsg?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        
        function sendForm() {
          const formData = new FormData(form);

          return fetch('mail.php', { method: 'POST', body: formData })

          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              return Promise.resolve();
            } else {
              console.error('メール送信エラー:', data.message); // PHP メッセージはログに出すだけ
              return Promise.reject();
            }
          })
          .catch(err => {
            console.error('送信処理でエラー:', err); // fetch / 通信エラーなど
            return Promise.reject();
          });
        }
      });
    }

/* ========================================
  swiper
======================================== */
    // Swiperがまだロードされていない場合は動的読み込み
    if (typeof Swiper === 'undefined') {
      $.getScript('/js/swiper-bundle.min.js', function () {
        // Swiper読み込み完了後に初期化
        initskillSlider();
      });
    } else {
      // 既にSwiperが読み込まれている場合はそのまま初期化
      initskillSlider();
    }
  });

  function initskillSlider() {
    const sliderContainer = document.querySelector('.js-swiper-1');
    if (!sliderContainer) return;

    const btnNext = sliderContainer.querySelector('.swiper-button.next');
    const btnPrev = sliderContainer.querySelector('.swiper-button.prev');
    const counterCurrent = sliderContainer.querySelector('.swiper-num-inner .current');
    const counterTotal = sliderContainer.querySelector('.swiper-num-inner .total');

    const slidesWrapper = sliderContainer.querySelector('.swiper-wrapper');
    const originalSlideCount = slidesWrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)').length;

    const swiper = new Swiper(sliderContainer, {
      loop: true,
      centeredSlides: true,
      grabCursor: true,
      slidesPerView: 'auto',
      slideToClickedSlide: true,
      effect: 'coverflow',
      autoplay: {
        delay: 3000,
        disableOnInteraction: true
      },
      coverflowEffect: {
        scale: 0.9,
        rotate: 30,
        stretch: 90,
        depth: 180,
        modifier: 1,
        slideShadows: false
      },
      breakpoints: {
        1025: {
          slidesPerView: 'auto',
          coverflowEffect: {
            rotate: 30,
            stretch: 90,
            depth: 130,
            scale: 1,
            slideShadows: false
          }
        },
        768: {
          slidesPerView: 'auto',
          coverflowEffect: {
            rotate: 30,
            stretch: 85,
            depth: 150,
            scale: 1,
            slideShadows: false
          }
        },
      },
      navigation: {
        nextEl: btnNext,
        prevEl: btnPrev
      },
      on: {
        init() {
          // 初期は止める
          this.autoplay.stop();
          if (counterTotal) counterTotal.textContent = originalSlideCount;
          if (counterCurrent) counterCurrent.textContent = 1;
        },
        slideChange() {
          if (counterCurrent) counterCurrent.textContent = (this.realIndex % originalSlideCount) + 1;
        },
      },
    });

    // 表示中のみ autoplay
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          swiper.el.style.willChange = 'transform';
          swiper.autoplay.start();
        } else {
          swiper.autoplay.stop();
          swiper.el.style.willChange = 'auto';
        }
      });
    }, { threshold: 0.3 }); // 30%見えたら再生
    observer.observe(sliderContainer);
  }
/* ========================================
  scroll
======================================== */
 // パララックス
  const $parallaxImage = $('.js-parallax');
  const $fvSection = $('.section-fv');
  /* 最適化用（rAF 集約）
====================================== */
  function createRafScrollHandler(callback) {
    let ticking = false;

    return function () {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  }
  const onScrollOptimized = createRafScrollHandler(() => {

    // フェードイン
    revealOnScroll();

    /* ヘッダースクロールエフェクト
====================================== */
    $header.toggleClass('scrolled', $win.scrollTop() > 50);

    /* パララックス
====================================== */
    if ($fvSection.length && $parallaxImage.length) {
      const scrollPos = $win.scrollTop();
      const sectionOffset = $fvSection.offset().top;
      const sectionHeight = $fvSection.outerHeight();
      if (scrollPos < sectionOffset + sectionHeight) {
        const offset = (scrollPos - sectionOffset) * -0.08;
        $parallaxImage.css('transform', `translateY(${offset}px)`);
      }
    }
    // skillの円背景
    updateCircle();
  });

  $win.on('scroll', onScrollOptimized);
  $win.on('resize', updateCircle);
  // 初回実行
  onScrollOptimized();
});