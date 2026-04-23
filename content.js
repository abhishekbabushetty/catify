// Instead of hitting an external API that can be rate-limited, fail, or be slow, 
// we use a hardcoded pool of permanent, highly reliable Unsplash cat images.
// This means ZERO external dependencies, instant loading from browser cache, and zero lag.
const CAT_IMAGES = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400',
  'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400',
  'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
  'https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=400',
  'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400',
  'https://images.unsplash.com/photo-1529778458776-4ea4db567eec?w=400',
  'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=400',
  'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400',
  'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400',
  'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400'
];

function isCat(url) {
  if (!url) return false;
  return CAT_IMAGES.some(cat => url.includes(cat));
}

function getRandomCat() {
  return CAT_IMAGES[Math.floor(Math.random() * CAT_IMAGES.length)];
}

function replaceWithCat(el) {
  if (el.dataset.catified === 'true') return;

  const cat = getRandomCat();
  let modified = false;

  // 1. Process standard Images
  if (el.tagName === 'IMG') {
    if (!isCat(el.src)) {
      el.src = cat;
      if (el.srcset) el.removeAttribute('srcset');
      modified = true;
    }
    el.style.objectFit = 'cover';
  } 
  // 2. Process Picture <source> tags
  else if (el.tagName === 'SOURCE') {
    if (!isCat(el.srcset)) {
      el.srcset = cat;
      modified = true;
    }
  }
  // 3. Process SVG embedded images
  else if (el.tagName === 'IMAGE') {
    const href = el.getAttribute('href');
    if (!isCat(href)) {
      el.setAttribute('href', cat);
      modified = true;
    }
  } 
  // 4. Process ANY element with an inline CSS background-image
  else {
    if (el.style && el.style.backgroundImage && el.style.backgroundImage !== 'none' && el.style.backgroundImage !== '') {
      if (!isCat(el.style.backgroundImage)) {
        el.style.backgroundImage = `url("${cat}")`;
        el.style.backgroundSize = 'cover';
        modified = true;
      }
    }
  }

  // Forcefully overwrite ANY weird attribute a framework uses to lazy-load an image (e.g. data-src, data-original, data-url)
  if (el.attributes) {
    for (let i = 0; i < el.attributes.length; i++) {
      const attrName = el.attributes[i].name.toLowerCase();
      if ((attrName.includes('src') || attrName.includes('original') || attrName.includes('image') || attrName === 'data-url') 
          && attrName !== 'src' && attrName !== 'srcset') {
        const val = el.getAttribute(attrName);
        if (!isCat(val)) {
          el.setAttribute(attrName, cat);
          modified = true;
        }
      }
    }
  }

  // Tag so we don't end in infinite loops
  if (modified) {
    el.dataset.catified = 'true';
  }
}

function replaceAll() {
  // Ultra-aggressive query: selects imgs, sources, svgs, AND divs/spans that have a background image!
  const elements = document.querySelectorAll('img, picture > source, svg > image, [style*="background-image"], [style*="background: "], [style*="background:url"]');
  for (let i = 0; i < elements.length; i++) {
    replaceWithCat(elements[i]);
  }
}

// Run immediately
replaceAll();

// Relentless Fallback Interval: Runs every 2 seconds to systematically destroy any advanced lazy-loading 
// UI frameworks that try to bypass mutation observers.
setInterval(() => {
  replaceAll();
}, 2000); 

// Bulletproof Mutation Observer
let timeoutId = null;
const observer = new MutationObserver((mutations) => {
  let shouldReplace = false;

  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i];

    // Catch DOM additions
    if (mutation.addedNodes.length > 0) {
      shouldReplace = true;
    }

    // Catch inline style or attribute edits made by Google/React/Vue
    if (mutation.type === 'attributes') {
      const target = mutation.target;
      const attrName = mutation.attributeName.toLowerCase();
      
      if (attrName.includes('src') || attrName.includes('image') || attrName === 'style' || attrName === 'href') {
        let currentVal = '';
        if (attrName === 'style') {
          currentVal = target.style.backgroundImage || '';
        } else {
          currentVal = target.getAttribute(attrName) || '';
        }

        // Did the page's javascript sneakily revert an image back to a real photo?
        if (target.dataset.catified === 'true' && currentVal && currentVal !== 'none' && !isCat(currentVal)) {
          target.dataset.catified = 'false'; // Revoke catified status
          shouldReplace = true;              // Rescan and re-catify
        } else if (target.tagName === 'IMG' || target.tagName === 'SOURCE') {
          shouldReplace = true;
        }
      }
    }
  }

  // Debouncing to maintain frame rate
  if (shouldReplace) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      replaceAll();
    }, 20); 
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  // We no longer filter attributes, so we can catch ANY custom attribute (like 'data-vis-id') Google uses to load pictures
  attributes: true
});
