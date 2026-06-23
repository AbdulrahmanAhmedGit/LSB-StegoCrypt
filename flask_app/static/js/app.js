// Progressive Enhancement: Add class to root element to trigger scroll transitions ONLY if JS is enabled
document.documentElement.classList.add('js-enabled');

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let currentLang = localStorage.getItem('lang') || 'en';
  let currentTheme = localStorage.getItem('theme') || 'dark';
  let translations = {};

  // --- HTML ELEMENTS ---
  const htmlEl = document.documentElement;
  const langToggleBtn = document.getElementById('lang-toggle');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Initialization is deferred to the end of DOMContentLoaded to avoid temporal dead zone errors for component variables.

  // --- THEME MANAGEMENT ---
  function initTheme() {
    htmlEl.setAttribute('data-theme', currentTheme);
    updateThemeIcon();

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon();
      });
    }
  }

  function updateThemeIcon() {
    if (!themeIcon) return;
    if (currentTheme === 'light') {
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>`;
    } else {
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>`;
    }
  }

  // --- INTERNATIONALIZATION (i18n) ---
  async function initI18n() {
    await loadLanguage(currentLang);

    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        loadLanguage(currentLang);
      });
    }
  }

  async function loadLanguage(lang) {
    try {
      const response = await fetch(`/static/translations/${lang}.json`);
      translations = await response.json();
      currentLang = lang;
      localStorage.setItem('lang', lang);
      
      // Update DOM text content
      translateDOM();
      
      // Toggle LTR / RTL direction states
      if (lang === 'ar') {
        htmlEl.setAttribute('dir', 'rtl');
        htmlEl.setAttribute('lang', 'ar');
        if (langToggleBtn) langToggleBtn.innerHTML = '<span>English</span>';
      } else {
        htmlEl.setAttribute('dir', 'ltr');
        htmlEl.setAttribute('lang', 'en');
        if (langToggleBtn) langToggleBtn.innerHTML = '<span>العربية</span>';
      }

      // Refresh dynamic components to reflect language changes
      updateArchitectureLabels();
      updateCodeExplorerLabels();
    } catch (error) {
      console.error("Failed to load translation:", error);
    }
  }

  function translateDOM() {
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getNestedValue(translations, key);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });
  }

  function getNestedValue(obj, keyPath) {
    return keyPath.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // --- IMAGE SLIDER & EXAMINER ---
  function initSlider() {
    const container = document.querySelector('.slider-container');
    const handle = document.querySelector('.slider-handle');
    const examinerPixels = document.querySelectorAll('.examiner-pixel');

    if (!container || !handle) return;

    let isSliding = false;

    const slide = (clientX) => {
      const rect = container.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      if (pos < 0) pos = 0;
      if (pos > 1) pos = 1;
      
      container.style.setProperty('--slide-pos', pos);
      updateExaminerGrid(pos);
    };

    const startSlide = (e) => {
      isSliding = true;
      slide(e.clientX || e.touches[0].clientX);
    };

    const stopSlide = () => { isSliding = false; };

    const onSlideMove = (e) => {
      if (!isSliding) return;
      slide(e.clientX || (e.touches && e.touches[0].clientX));
    };

    // Event listeners
    handle.addEventListener('mousedown', startSlide);
    container.addEventListener('mousedown', (e) => {
      if (e.target !== handle && !handle.contains(e.target)) {
        slide(e.clientX);
      }
    });
    window.addEventListener('mouseup', stopSlide);
    window.addEventListener('mousemove', onSlideMove);

    // Touch events for mobile responsiveness
    handle.addEventListener('touchstart', startSlide, { passive: true });
    container.addEventListener('touchstart', (e) => {
      if (e.target !== handle && !handle.contains(e.target)) {
        slide(e.touches[0].clientX);
      }
    }, { passive: true });
    window.addEventListener('touchend', stopSlide);
    window.addEventListener('touchmove', onSlideMove, { passive: true });

    // Simulate bit modification on LSB hover zoom grid
    function updateExaminerGrid(pos) {
      if (examinerPixels.length === 0) return;
      examinerPixels.forEach((pixel, idx) => {
        // High slider position represents Stego (where bits are injected)
        const isStego = pos > (idx / examinerPixels.length);
        
        let baseVal = 120 + (idx * 23) % 110;
        let lsb = isStego ? ((idx * 5 + 3) % 2) : 0;
        let finalVal = (baseVal & 254) | lsb;

        let channel = idx % 3 === 0 ? 'R' : (idx % 3 === 1 ? 'G' : 'B');
        let channelColor = idx % 3 === 0 ? '#EF4444' : (idx % 3 === 1 ? '#10B981' : '#3B82F6');
        
        pixel.style.borderInlineStart = `3px solid ${channelColor}`;
        pixel.innerHTML = `
          <span style="font-size: 0.6rem; font-weight:bold; color:${channelColor}">${channel}</span>
          <span style="font-size: 0.8rem; font-weight:800; color:var(--text-main); margin-block: 2px;">${finalVal}</span>
          <span style="font-size: 0.55rem; color:var(--text-muted)">[${finalVal.toString(2).padStart(8, '0')}]</span>
        `;
      });
    }

    updateExaminerGrid(0.5);
  }

  // --- ARCHITECTURE FLOW PIPELINES ---
  let activeFlow = 'encode';
  const flowNodes = document.querySelectorAll('.arch-node');
  const btnEncode = document.getElementById('btn-arch-encode');
  const btnDecode = document.getElementById('btn-arch-decode');

  function initArchitecture() {
    if (!btnEncode || !btnDecode) return;

    btnEncode.addEventListener('click', () => {
      activeFlow = 'encode';
      updateArchitectureLayout();
    });

    btnDecode.addEventListener('click', () => {
      activeFlow = 'decode';
      updateArchitectureLayout();
    });

    updateArchitectureLayout();
  }

  function updateArchitectureLayout() {
    if (activeFlow === 'encode') {
      btnEncode.classList.add('btn-primary');
      btnEncode.classList.remove('btn-secondary');
      btnDecode.classList.add('btn-secondary');
      btnDecode.classList.remove('btn-primary');
    } else {
      btnDecode.classList.add('btn-primary');
      btnDecode.classList.remove('btn-secondary');
      btnEncode.classList.add('btn-secondary');
      btnEncode.classList.remove('btn-primary');
    }

    updateArchitectureLabels();
  }

  function updateArchitectureLabels() {
    if (!translations.architecture) return;

    const captionText = document.getElementById('arch-caption');
    const nodes = [
      document.getElementById('node-1'),
      document.getElementById('node-2'),
      document.getElementById('node-3'),
      document.getElementById('node-4'),
      document.getElementById('node-5'),
      document.getElementById('node-6')
    ];

    // Safely check elements and map names dynamically
    if (activeFlow === 'encode') {
      if (captionText) captionText.innerHTML = translations.architecture.caption_encode;
      if (nodes[0]) nodes[0].innerHTML = translations.architecture.node_text;
      if (nodes[1]) nodes[1].innerHTML = translations.architecture.node_encrypt;
      if (nodes[2]) nodes[2].innerHTML = translations.architecture.node_compress;
      if (nodes[3]) nodes[3].innerHTML = translations.architecture.node_binary;
      if (nodes[4]) nodes[4].innerHTML = translations.architecture.node_embed;
      if (nodes[5]) nodes[5].innerHTML = translations.architecture.node_image;
      
      highlightNodesSequence([0, 1, 2, 3, 4, 5]);
    } else {
      if (captionText) captionText.innerHTML = translations.architecture.caption_decode;
      if (nodes[0]) nodes[0].innerHTML = translations.architecture.node_image;
      if (nodes[1]) {
        nodes[1].innerHTML = currentLang === 'ar' ? 'استخراج LSB' : 'LSB Extract';
      }
      if (nodes[2]) nodes[2].innerHTML = translations.architecture.node_binary;
      if (nodes[3]) {
        nodes[3].innerHTML = currentLang === 'ar' ? 'فك ضغط (zlib)' : 'Decompress (zlib)';
      }
      if (nodes[4]) {
        nodes[4].innerHTML = currentLang === 'ar' ? 'فك التشفير (Fernet)' : 'Decrypt (Fernet)';
      }
      if (nodes[5]) {
        nodes[5].innerHTML = currentLang === 'ar' ? 'النص المستخرج' : 'Plaintext Output';
      }

      highlightNodesSequence([0, 1, 2, 3, 4, 5]);
    }
  }

  let flowInterval;
  function highlightNodesSequence(order) {
    clearInterval(flowInterval);
    const arrows = document.querySelectorAll('.arch-arrow');
    
    let step = 0;
    const animateStep = () => {
      flowNodes.forEach(node => node.classList.remove('active-node'));
      arrows.forEach(arrow => arrow.classList.remove('pulse-active'));
      
      const currentNodeIndex = order[step];
      if (flowNodes[currentNodeIndex]) {
        flowNodes[currentNodeIndex].classList.add('active-node');
      }
      
      // Pulse the connection arrow after the current active node
      if (step < order.length - 1) {
        if (arrows[step]) {
          arrows[step].classList.add('pulse-active');
        }
      }
      
      step = (step + 1) % order.length;
    };
    
    animateStep();
    flowInterval = setInterval(animateStep, 2000);
  }

  // --- CODE EXPLORER TABS ---
  const fileCodes = {
    lsb: `
<span class="code-comment"># LSB.py - CLI Steganography & Encryption pipeline</span>
<span class="code-keyword">def</span> <span class="code-function">prepare_data</span>(data, password):
    password_bytes = password.encode(<span class="code-string">'utf-8'</span>)
    sha256_hash = hashlib.sha256(password_bytes).digest()
    fernet_key = base64.urlsafe_b64encode(sha256_hash)
    f = Fernet(fernet_key)
    
    en_d = f.encrypt(data.encode(<span class="code-string">'utf-8'</span>))
    compressed = zlib.compress(en_d)
    
    binary_data = <span class="code-string">''</span>
    <span class="code-keyword">for</span> b <span class="code-keyword">in</span> compressed:
        binary_data += format(b, <span class="code-string">'08b'</span>)
    <span class="code-keyword">return</span> binary_data + <span class="code-string">'0000000000000000'</span> <span class="code-comment"># End Stopper</span>

<span class="code-keyword">def</span> <span class="code-function">encode_image</span>(image, coded_data, output):
    img = Image.open(image).convert(<span class="code-string">'RGB'</span>)
    w, h = img.size
    <span class="code-keyword">if</span> (w * h * 3) &lt; len(coded_data):
        <span class="code-keyword">raise</span> ValueError(<span class="code-string">"Image size is suitable for the message"</span>)
    
    pixels = list(img.getdata())
    new_pixels = []
    pointer = 0
    ...
    <span class="code-comment"># Set bit 0 of channel values to code bits</span>
`,
    test: `
<span class="code-comment"># test_LSB.py - Pytest Verification Suites</span>
<span class="code-keyword">def</span> <span class="code-function">test_recover_message</span>():
    create_test_image(<span class="code-string">"input_test.png"</span>)
    bits = prepare_data(<span class="code-string">"Hello CS50"</span>, <span class="code-string">"password123"</span>)
    encode_image(<span class="code-string">"input_test.png"</span>, bits, <span class="code-string">"output_test.png"</span>)
    
    extracted = decode_image(<span class="code-string">"output_test.png"</span>)
    assert recover_message(extracted, <span class="code-string">"password123"</span>) == <span class="code-string">"Hello CS50"</span>
    
    os.remove(<span class="code-string">"input_test.png"</span>)
    os.remove(<span class="code-string">"output_test.png"</span>)
`,
    req: `
<span class="code-comment"># requirements.txt - External Dependencies</span>
pillow&gt;=10.0.0
cryptography&gt;=41.0.0
pytest&gt;=8.0.0
`,
    readme: `
<span class="code-comment"># LSB-StegoCrypt</span>
Command-Line Interface (CLI) application developed in Python.
Combines:
1. **Strong Encryption:** AES-128 via cryptography
2. **zlib Compression:** Deflate-based payload packing
3. **LSB Steganography:** Bit-shifting via PIL Pillow
4. **End Marker:** 16-bit trailing delimiter stopper
`
  };

  const fileExplorerBtns = document.querySelectorAll('.explorer-file-btn');
  const codeTitle = document.getElementById('explorer-code-title');
  const codeTag = document.getElementById('explorer-code-tag');
  const codeView = document.getElementById('explorer-code-view');
  const fileDesc = document.getElementById('explorer-file-desc');

  function initCodeExplorer() {
    fileExplorerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fileExplorerBtns.forEach(b => b.classList.remove('active-file'));
        btn.classList.add('active-file');
        
        const fileKey = btn.getAttribute('data-file');
        if (codeView) codeView.innerHTML = fileCodes[fileKey];
        updateCodeExplorerLabels();
      });
    });

    if (codeView) {
      codeView.innerHTML = fileCodes['lsb'];
    }
  }

  function updateCodeExplorerLabels() {
    if (!translations.code) return;
    const activeBtn = document.querySelector('.explorer-file-btn.active-file');
    if (!activeBtn) return;

    const fileKey = activeBtn.getAttribute('data-file');
    if (codeTitle) codeTitle.innerText = translations.code[`file_${fileKey}`] || '';
    if (codeTag) codeTag.innerText = fileKey === 'req' ? 'txt' : (fileKey === 'readme' ? 'md' : 'py');
    if (fileDesc) fileDesc.innerHTML = translations.code[`desc_${fileKey}`] || '';
  }

  // --- STATS COUNT-UP ANIMATION ---
  function initCounters() {
    const metricCards = document.querySelectorAll('.metric-card');
    
    const countUp = (el) => {
      const numEl = el.querySelector('.counter-value');
      if (!numEl) return;
      const target = parseFloat(numEl.getAttribute('data-target'));
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const ease = progress * (2 - progress);
        const currentVal = Math.floor(ease * target);
        
        numEl.innerText = currentVal;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          numEl.innerText = target;
        }
      };

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    metricCards.forEach(card => observer.observe(card));
  }

  // --- ACCORDION FAQS ---
  function initFaqs() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger) return;
      
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active-faq');
        faqItems.forEach(i => i.classList.remove('active-faq'));
        if (!isActive) {
          item.classList.add('active-faq');
        }
      });
    });
  }

  // --- INITIALIZATION ---
  // Run all module initializations now that all variables are fully declared
  initTheme();
  initI18n();
  initSlider();
  initArchitecture();
  initCodeExplorer();
  initCounters();
  initFaqs();

  // --- SCROLL ANIMATIONS (Fade Up Reveal) ---
  const fadeReveals = document.querySelectorAll('.fade-up-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  fadeReveals.forEach(el => revealObserver.observe(el));
});
