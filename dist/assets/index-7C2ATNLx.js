(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&e(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function e(s){if(s.ep)return;s.ep=!0;const a=i(s);fetch(s.href,a)}})();var P="1.3.27";function D(o,t,i){return Math.max(o,Math.min(t,i))}function B(o,t,i){return(1-i)*o+i*t}function N(o,t,i,e){return B(o,t,1-Math.exp(-i*e))}function F(o,t){return(o%t+t)%t}var $=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(o){if(!this.isRunning)return;let t=!1;if(this.duration&&this.easing){this.currentTime+=o;const i=D(0,this.currentTime/this.duration,1);t=i>=1;const e=t?1:this.easing(i);this.value=this.from+(this.to-this.from)*e}else this.lerp?(this.value=N(this.value,this.to,this.lerp*60,o),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,t=!0)):(this.value=this.to,t=!0);t&&this.stop(),this.onUpdate?.(this.value,t)}stop(){this.isRunning=!1}fromTo(o,t,{lerp:i,duration:e,easing:s,onStart:a,onUpdate:r}){this.from=this.value=o,this.to=t,this.lerp=i,this.duration=e,this.easing=s,this.currentTime=0,this.isRunning=!0,a?.(),this.onUpdate=r}};function z(o,t){let i;return function(...e){clearTimeout(i),i=setTimeout(()=>{i=void 0,o.apply(this,e)},t)}}var W=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(o,t,{autoResize:i=!0,debounce:e=250}={}){this.wrapper=o,this.content=t,i&&(this.debouncedResize=z(this.resize,e),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},X=class{events={};emit(o,...t){const i=this.events[o]||[];for(let e=0,s=i.length;e<s;e++)i[e]?.(...t)}on(o,t){return this.events[o]?this.events[o].push(t):this.events[o]=[t],()=>{this.events[o]=this.events[o]?.filter(i=>t!==i)}}off(o,t){this.events[o]=this.events[o]?.filter(i=>t!==i)}destroy(){this.events={}}};const O=100/6,_={passive:!1};function L(o,t){return o===1?O:o===2?t:1}var Y=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new X;constructor(o,t={wheelMultiplier:1,touchMultiplier:1}){this.element=o,this.options=t,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,_),this.element.addEventListener("touchstart",this.onTouchStart,_),this.element.addEventListener("touchmove",this.onTouchMove,_),this.element.addEventListener("touchend",this.onTouchEnd,_)}on(o,t){return this.emitter.on(o,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,_),this.element.removeEventListener("touchstart",this.onTouchStart,_),this.element.removeEventListener("touchmove",this.onTouchMove,_),this.element.removeEventListener("touchend",this.onTouchEnd,_)}onTouchStart=o=>{const{clientX:t,clientY:i}=o.targetTouches?o.targetTouches[0]:o;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:o})};onTouchMove=o=>{const{clientX:t,clientY:i}=o.targetTouches?o.targetTouches[0]:o,e=-(t-this.touchStart.x)*this.options.touchMultiplier,s=-(i-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:e,y:s},this.emitter.emit("scroll",{deltaX:e,deltaY:s,event:o})};onTouchEnd=o=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:o})};onWheel=o=>{let{deltaX:t,deltaY:i,deltaMode:e}=o;const s=L(e,this.window.width),a=L(e,this.window.height);t*=s,i*=a,t*=this.options.wheelMultiplier,i*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:i,event:o})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}};const A=o=>Math.min(1,1.001-2**(-10*o));var H=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;_isDraggingSelection=!1;reducedMotionMediaQuery=window.matchMedia("(prefers-reduced-motion: reduce)");isTouching;isIos;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new $;emitter=new X;dimensions;virtualScroll;constructor({wrapper:o=window,content:t=document.documentElement,eventsTarget:i=o,smoothWheel:e=!0,syncTouch:s=!1,syncTouchLerp:a=.075,touchInertiaExponent:r=1.7,duration:l,easing:c,lerp:n=.1,infinite:h=!1,orientation:d="vertical",gestureOrientation:p=d==="horizontal"?"both":"vertical",touchMultiplier:u=1,wheelMultiplier:g=1,autoResize:m=!0,prevent:v,virtualScroll:f,overscroll:b=!0,autoRaf:w=!1,anchors:S=!1,autoToggle:C=!1,allowNestedScroll:x=!1,__experimental__naiveDimensions:E=!1,naiveDimensions:T=E,stopInertiaOnNavigate:I=!1,respectReducedMotion:R=!0}={}){window.lenisVersion=P,window.lenis||(window.lenis={}),window.lenis.version=P,d==="horizontal"&&(window.lenis.horizontal=!0),s===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!o||o===document.documentElement)&&(o=window),typeof l=="number"&&typeof c!="function"?c=A:typeof c=="function"&&typeof l!="number"&&(l=1),this.options={wrapper:o,content:t,eventsTarget:i,smoothWheel:e,syncTouch:s,syncTouchLerp:a,touchInertiaExponent:r,duration:l,easing:c,lerp:n,infinite:h,gestureOrientation:p,orientation:d,touchMultiplier:u,wheelMultiplier:g,autoResize:m,prevent:v,virtualScroll:f,overscroll:b,autoRaf:w,anchors:S,autoToggle:C,allowNestedScroll:x,naiveDimensions:T,stopInertiaOnNavigate:I,respectReducedMotion:R},this.dimensions=new W(o,t,{autoResize:m}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new Y(i,{touchMultiplier:u,wheelMultiplier:g}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(o,t){return this.emitter.on(o,t)}off(o,t){return this.emitter.off(o,t)}onScrollEnd=o=>{o instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&o.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){const o=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[o]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=o=>{o.propertyName?.includes("overflow")&&o.target===this.rootElement&&this.checkOverflow()};setScroll(o){this.isHorizontal?this.options.wrapper.scrollTo({left:o,behavior:"instant"}):this.options.wrapper.scrollTo({top:o,behavior:"instant"})}onClick=o=>{const t=o.composedPath().filter(e=>e instanceof HTMLAnchorElement&&e.href).map(e=>new URL(e.href)),i=new URL(window.location.href);if(this.options.anchors){const e=t.find(s=>i.host===s.host&&i.pathname===s.pathname&&s.hash);if(e){const s=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,a=decodeURIComponent(e.hash);this.scrollTo(a,s);return}}if(this.options.stopInertiaOnNavigate&&t.some(e=>i.host===e.host&&i.pathname!==e.pathname)){this.reset();return}};onPointerDown=o=>{o.button===1&&this.reset()};isTouchOnSelectionHandle(o){const t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return!1;const i=o.targetTouches[0]??o.changedTouches[0];if(!i)return!1;const e=t.getRangeAt(0).getClientRects();if(e.length===0)return!1;const s=e[0],a=e[e.length-1],r=40,l=Math.hypot(i.clientX-s.left,i.clientY-s.top)<=r,c=Math.hypot(i.clientX-a.right,i.clientY-a.bottom)<=r;return l||c}onVirtualScroll=o=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(o)===!1)return;const{deltaX:t,deltaY:i,event:e}=o;if(this.emitter.emit("virtual-scroll",{deltaX:t,deltaY:i,event:e}),e.ctrlKey||e.lenisStopPropagation)return;const s=e.type.includes("touch"),a=e.type.includes("wheel");if(s&&this.isIos&&(e.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(e)),this._isDraggingSelection)){e.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=e.type==="touchstart"||e.type==="touchmove";const r=t===0&&i===0;if(this.options.syncTouch&&s&&e.type==="touchstart"&&r&&!this.isStopped&&!this.isLocked){this.reset();return}const l=this.options.gestureOrientation==="vertical"&&i===0||this.options.gestureOrientation==="horizontal"&&t===0;if(r||l)return;let c=e.composedPath();c=c.slice(0,c.indexOf(this.rootElement));const n=this.options.prevent,h=Math.abs(t)>=Math.abs(i)?"horizontal":"vertical";if(c.find(g=>g instanceof HTMLElement&&(typeof n=="function"&&n?.(g)||g.hasAttribute?.("data-lenis-prevent")||h==="vertical"&&g.hasAttribute?.("data-lenis-prevent-vertical")||h==="horizontal"&&g.hasAttribute?.("data-lenis-prevent-horizontal")||s&&g.hasAttribute?.("data-lenis-prevent-touch")||a&&g.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.hasNestedScroll(g,{deltaX:t,deltaY:i}))))return;if(this.isStopped||this.isLocked){e.cancelable&&e.preventDefault();return}if(!(this.options.syncTouch&&s||this.options.smoothWheel&&a)){this.isScrolling="native",this.animate.stop(),e.lenisStopPropagation=!0;return}let d=i;this.options.gestureOrientation==="both"?d=Math.abs(i)>Math.abs(t)?i:t:this.options.gestureOrientation==="horizontal"&&(d=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&i>0||this.animatedScroll===this.limit&&i<0))&&(e.lenisStopPropagation=!0),e.cancelable&&e.preventDefault();const p=s&&this.options.syncTouch,u=s&&e.type==="touchend";u&&(d=Math.sign(d)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+d,{programmatic:!1,...p?{lerp:u?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const o=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-o,this.direction=Math.sign(this.animatedScroll-o),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=o=>{const t=o-(this.time||o);this.time=o,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(o,{offset:t=0,immediate:i=!1,lock:e=!1,programmatic:s=!0,lerp:a=s?this.options.lerp:void 0,duration:r=s?this.options.duration:void 0,easing:l=s?this.options.easing:void 0,onStart:c,onComplete:n,force:h=!1,userData:d}={}){if(this.prefersReducedMotion&&(s?i=!0:(a=1,r=void 0,l=void 0)),(this.isStopped||this.isLocked)&&!h)return;let p=o,u=t;if(typeof p=="string"&&["top","left","start","#"].includes(p))p=0;else if(typeof p=="string"&&["bottom","right","end"].includes(p))p=this.limit;else{let g=null;if(typeof p=="string"?(g=p.startsWith("#")?document.getElementById(p.slice(1)):document.querySelector(p),g||(p==="#top"?p=0:console.warn("Lenis: Target not found",p))):p instanceof Element&&(g=p),g){if(this.options.wrapper!==window){const S=this.rootElement.getBoundingClientRect();u-=this.isHorizontal?S.left:S.top}const m=g.getBoundingClientRect(),v=getComputedStyle(g),f=this.isHorizontal?Number.parseFloat(v.scrollMarginLeft):Number.parseFloat(v.scrollMarginTop),b=getComputedStyle(this.rootElement),w=this.isHorizontal?Number.parseFloat(b.scrollPaddingLeft):Number.parseFloat(b.scrollPaddingTop);p=(this.isHorizontal?m.left:m.top)+this.animatedScroll-(Number.isNaN(f)?0:f)-(Number.isNaN(w)?0:w)}}if(typeof p=="number"){if(p+=u,this.options.infinite){if(s){this.targetScroll=this.animatedScroll=this.scroll;const g=p-this.animatedScroll;g>this.limit/2?p-=this.limit:g<-this.limit/2&&(p+=this.limit)}}else p=D(0,p,this.limit);if(p===this.targetScroll){c?.(this),n?.(this);return}if(this.userData=d??{},i){this.animatedScroll=this.targetScroll=p,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),n?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}s||(this.targetScroll=p),typeof r=="number"&&typeof l!="function"?l=A:typeof l=="function"&&typeof r!="number"&&(r=1),this.animate.fromTo(this.animatedScroll,p,{duration:r,easing:l,lerp:a,onStart:()=>{e&&(this.isLocked=!0),this.isScrolling="smooth",c?.(this)},onUpdate:(g,m)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=g-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=g,this.setScroll(this.scroll),s&&(this.targetScroll=g),m||this.emit(),m&&(this.reset(),this.emit(),n?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(o,{deltaX:t,deltaY:i}){const e=Date.now();o._lenis||(o._lenis={});const s=o._lenis;let a,r,l,c,n,h,d,p,u,g;if(e-(s.time??0)>2e3){s.time=Date.now();const x=window.getComputedStyle(o);if(s.computedStyle=x,a=["auto","overlay","scroll"].includes(x.overflowX),r=["auto","overlay","scroll"].includes(x.overflowY),n=["auto"].includes(x.overscrollBehaviorX),h=["auto"].includes(x.overscrollBehaviorY),s.hasOverflowX=a,s.hasOverflowY=r,!(a||r))return!1;d=o.scrollWidth,p=o.scrollHeight,u=o.clientWidth,g=o.clientHeight,l=d>u,c=p>g,s.isScrollableX=l,s.isScrollableY=c,s.scrollWidth=d,s.scrollHeight=p,s.clientWidth=u,s.clientHeight=g,s.hasOverscrollBehaviorX=n,s.hasOverscrollBehaviorY=h}else l=s.isScrollableX,c=s.isScrollableY,a=s.hasOverflowX,r=s.hasOverflowY,d=s.scrollWidth,p=s.scrollHeight,u=s.clientWidth,g=s.clientHeight,n=s.hasOverscrollBehaviorX,h=s.hasOverscrollBehaviorY;if(!(a&&l||r&&c))return!1;const m=Math.abs(t)>=Math.abs(i)?"horizontal":"vertical";let v,f,b,w,S,C;if(m==="horizontal")v=Math.round(o.scrollLeft),f=d-u,b=t,w=a,S=l,C=n;else if(m==="vertical")v=Math.round(o.scrollTop),f=p-g,b=i,w=r,S=c,C=h;else return!1;return!C&&(v>=f||v<=0)?!0:(b>0?v<f:v>0)&&w&&S}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const o=this.options.wrapper;return this.isHorizontal?o.scrollX??o.scrollLeft:o.scrollY??o.scrollTop}get scroll(){return this.options.infinite?F(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(o){this._isScrolling!==o&&(this._isScrolling=o,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(o){this._isStopped!==o&&(this._isStopped=o,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(o){this._isLocked!==o&&(this._isLocked=o,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let o="lenis";return this.options.autoToggle&&(o+=" lenis-autoToggle"),this.isStopped&&(o+=" lenis-stopped"),this.isLocked&&(o+=" lenis-locked"),this.isScrolling&&(o+=" lenis-scrolling"),this.isScrolling==="smooth"&&(o+=" lenis-smooth"),o}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(o=>{this.rootElement.classList.add(o)})}cleanUpClassName(){for(const o of Array.from(this.rootElement.classList))(o==="lenis"||o.startsWith("lenis-"))&&this.rootElement.classList.remove(o)}};let k=null;class q{lenis=null;rafId=null;constructor(){this.init(),k=this}init(){try{this.lenis=new H({duration:1.2,easing:i=>Math.min(1,1.001-Math.pow(2,-10*i)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,touchMultiplier:1.8});const t=i=>{this.lenis?.raf(i),this.rafId=requestAnimationFrame(t)};this.rafId=requestAnimationFrame(t)}catch(t){console.warn("Lenis smooth scroll fallback to native scroll",t)}}scrollTo(t,i){this.lenis?.scrollTo(t,i)}stop(){this.lenis?.stop()}start(){this.lenis?.start()}destroy(){this.rafId&&cancelAnimationFrame(this.rafId),this.lenis?.destroy()}}class V{routes=[];mountPoint;transitionEl;isTransitioning=!1;isInitialLoad=!0;constructor(t){this.mountPoint=t;let i=document.querySelector(".page-transition");i||(i=document.createElement("div"),i.className="page-transition",i.innerHTML='<div class="page-transition__panel"></div>',document.body.appendChild(i)),this.transitionEl=i,window.addEventListener("popstate",()=>this.handleCurrentRoute()),document.addEventListener("click",e=>this.handleLinkClicks(e))}register(t,i,e="Agrumêa Farm"){const s=[],a=t.replace(/:([a-zA-Z0-9_]+)/g,(l,c)=>(s.push(c),"([^/]+)")).replace(/\//g,"\\/"),r=new RegExp(`^${a}$`);this.routes.push({pattern:r,paramNames:s,handler:i,title:e})}navigate(t){window.location.pathname!==t&&(window.history.pushState({},"",t),this.handleCurrentRoute())}navigateTo(t){this.navigate(t)}handleLinkClicks(t){const i=t.target.closest("a[href]");if(!i)return;const e=i.getAttribute("href");!e||e.startsWith("http")||e.startsWith("mailto:")||e.startsWith("#")||(t.preventDefault(),this.navigate(e))}async handleCurrentRoute(){if(this.isTransitioning)return;this.isTransitioning=!0;const t=window.location.pathname||"/";let i=null,e={};for(const a of this.routes){const r=t.match(a.pattern);if(r){i=a,a.paramNames.forEach((l,c)=>{e[l]=r[c+1]});break}}if(!i&&this.routes.length>0&&(i=this.routes[0]),!i){this.isTransitioning=!1;return}if(this.isInitialLoad){this.isInitialLoad=!1,document.title=i.title,this.updateActiveNavLink(t),window.scrollTo(0,0),k?.scrollTo(0,{immediate:!0}),this.mountPoint.innerHTML="";const a=await i.handler(e);this.mountPoint.appendChild(a),this.isTransitioning=!1;return}this.transitionEl.classList.add("is-active"),document.title=i.title,this.updateActiveNavLink(t),await new Promise(a=>setTimeout(a,550)),window.scrollTo(0,0),k?.scrollTo(0,{immediate:!0}),this.mountPoint.innerHTML="";const s=await i.handler(e);this.mountPoint.appendChild(s),await new Promise(a=>setTimeout(a,550)),this.transitionEl.classList.remove("is-active"),this.isTransitioning=!1}updateActiveNavLink(t){document.querySelectorAll(".nav-link").forEach(i=>{const e=i.getAttribute("href");e===t||t!=="/"&&e!=="/"&&t.startsWith(e||"")?i.classList.add("active"):i.classList.remove("active")})}}class U{element;dot;pill;text;mouseX=-100;mouseY=-100;currentX=-100;currentY=-100;isVisible=!1;isHovering=!1;isGrabbing=!1;isRunning=!0;constructor(t="customCursor"){let i=document.getElementById(t);i||(i=document.createElement("div"),i.id=t,i.className="custom-cursor",i.innerHTML=`
        <div class="cursor-dot"></div>
        <div class="cursor-pill" id="cursorPill">
          <span class="cursor-diamond"></span>
          <span class="cursor-text" id="cursorText">EXPLORE</span>
        </div>
      `,document.body.appendChild(i)),this.element=i,this.dot=i.querySelector(".cursor-dot"),this.pill=i.querySelector(".cursor-pill"),this.text=i.querySelector(".cursor-text"),this.bindEvents(),this.loop=this.loop.bind(this),requestAnimationFrame(this.loop)}bindEvents(){window.addEventListener("mousemove",t=>{this.mouseX=t.clientX,this.mouseY=t.clientY,this.isVisible||(this.isVisible=!0,this.element.classList.add("is-visible"))}),document.addEventListener("mouseleave",()=>{this.isVisible=!1,this.element.classList.remove("is-visible")}),document.addEventListener("mouseenter",()=>{this.isVisible=!0,this.element.classList.add("is-visible")}),document.addEventListener("mousedown",()=>{this.isGrabbing=!0,this.element.classList.add("is-grabbing")}),document.addEventListener("mouseup",()=>{this.isGrabbing=!1,this.element.classList.remove("is-grabbing")})}setContext(t,i=!0){this.isHovering=i,this.text&&(this.text.textContent=t),i?this.element.classList.add("is-hovering"):this.element.classList.remove("is-hovering")}bindInteractive(t,i){t.forEach(e=>{e.addEventListener("mouseenter",()=>this.setContext(i,!0)),e.addEventListener("mouseleave",()=>this.setContext("EXPLORE",!1))})}loop(){this.isRunning&&(this.currentX+=(this.mouseX-this.currentX)*.22,this.currentY+=(this.mouseY-this.currentY)*.22,this.element.style.transform=`translate3d(${this.currentX}px, ${this.currentY}px, 0)`,requestAnimationFrame(this.loop))}destroy(){this.isRunning=!1}}const y=[{id:"smeraldo",slug:"smeraldo",title:"Sicilian Pistachio Pesto",latinSubtitle:"Pistacia Vera Siculus",category:"savory",price:"€8.50",weight:"210g ℮",origin:"Mount Etna Valley, Sicily",description:"Artisanal savory pesto crafted with 65% select Sicilian pistachios, cold-pressed extra virgin olive oil, and Trapani sea salt.",ingredients:["Sicilian Pistachio (65%)","Extra Virgin Olive Oil","Trapani Sea Salt","Black Pepper"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhgweQX7-eWdJF_Pesto-salato_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhgAeQX7-eWdJC_pesto_result-1.webp?auto=format,compress"},{id:"marmellata_arancia",slug:"marmellata_arancia",title:"Sliced Orange Marmalade",latinSubtitle:"Citrus Sinensis Dulcis",category:"sweet",price:"€6.80",weight:"260g ℮",origin:"Plain of Catania, Sicily",description:"Finely sliced sun-ripened blood and blonde Sicilian oranges slow-cooked with candied rind in copper caldrons.",ingredients:["Sicilian Oranges (70%)","Raw Cane Sugar","Fresh Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvgwQeQX7-eWdIy_arancia_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvg-QeQX7-eWdIz_arancia_result-1.webp?auto=format,compress"},{id:"caponata",slug:"caponata",title:"Traditional Sicilian Caponata",latinSubtitle:"Solanum Melongena Agrodolce",category:"savory",price:"€7.90",weight:"280g ℮",origin:"Floridia, Syracuse, Sicily",description:"Crisp fried eggplants in extra virgin olive oil, Nocellara olives, wild Pantelleria capers, and traditional sweet-and-sour reduction.",ingredients:["Sicilian Eggplants","Tomato Passata","Nocellara Olives","Capers","Apple Cider Vinegar"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhTgeQX7-eWdI0_caponata_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhdAeQX7-eWdI2_caponata_result-1.webp?auto=format,compress"},{id:"pestorosso",slug:"pestorosso",title:"Sun-Dried Tomato & Ricotta Pesto",latinSubtitle:"Lycopersicon Sol Siculo",category:"savory",price:"€6.90",weight:"200g ℮",origin:"Hyblaean Mountains, Ragusa",description:"Sun-drenched Sicilian tomatoes blended with artisanal salted ricotta, fresh sweet basil, and toasted pine nuts.",ingredients:["Sun-Dried Tomato (50%)","Extra Virgin Olive Oil","Salted Ricotta","Toasted Pine Nuts","Wild Oregano"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhfQeQX7-eWdI__pesto-rosso_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhfgeQX7-eWdJA_pesto-rosso_result-1.webp?auto=format,compress"},{id:"fregole_bacche",slug:"fregole_bacche",title:"Wild Strawberry & Goji Preserve",latinSubtitle:"Fragaria Vesca Vulcani",category:"sweet",price:"€7.50",weight:"230g ℮",origin:"Maletto, Mount Etna",description:"Wild Mount Etna forest strawberries paired with goji berries cultivated on mineral-rich volcanic potassium soils.",ingredients:["Etna Strawberries (75%)","Sicilian Goji Berries","Raw Cane Sugar","Fresh Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvheAeQX7-eWdI6_fragole_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhdweQX7-eWdI5_fragola_result.webp?auto=format,compress"},{id:"smeralda",slug:"smeralda",title:"Sweet Pistachio Cream",latinSubtitle:"Pistacia Dulcis Smeralda",category:"spread",price:"€9.50",weight:"200g ℮",origin:"Bronte, Mount Etna",description:"Velvety sweet green pistachio spread made from 45% pure Bronte PDO pistachio paste and rich cocoa butter.",ingredients:["Bronte Pistachio Paste (45%)","Raw Cane Sugar","Vegetable Oils","Cocoa Butter","Skimmed Milk"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhfweQX7-eWdJB_pesto_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhhAeQX7-eWdJG_pistacchio_result.webp?auto=format,compress"},{id:"gelsi_neri",slug:"gelsi_neri",title:"Black Mulberry Jam",latinSubtitle:"Morus Nigra Siculus",category:"sweet",price:"€9.20",weight:"220g ℮",origin:"Giarre & Riposto, Sicily",description:"Fresh black mulberries hand-picked at dawn along coastal orchards, celebrated for their deep floral aroma.",ingredients:["Sicilian Black Mulberries (80%)","Raw Cane Sugar","Natural Fruit Pectin","Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhegeQX7-eWdI8_gelsi_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvheQeQX7-eWdI7_gelsi_result-1.webp?auto=format,compress"},{id:"mennulata",slug:"mennulata",title:"Mennulata — Sweet Almond Cream",latinSubtitle:"Prunus Dulcis Avola",category:"spread",price:"€8.90",weight:"200g ℮",origin:"Avola & Noto, Sicily",description:"Pizzuta d'Avola almonds roasted gently on wood fire and stone-ground to a luxurious buttery spread.",ingredients:["Avola Pizzuta Almonds (50%)","Raw Cane Sugar","Extra Virgin Olive Oil","Bourbon Vanilla"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhfAeQX7-eWdI-_mandorla_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvheweQX7-eWdI9_mandorla_result-1.webp?auto=format,compress"},{id:"cipolla",slug:"cipolla",title:"Sweet & Sour Giarratana Onion",latinSubtitle:"Allium Cepa Giarratana",category:"condiment",price:"€6.50",weight:"280g ℮",origin:"Giarratana, Ragusa",description:"Remarkably sweet heirloom Giarratana onions braised slowly with fresh bay leaves, white wine vinegar, and wildflower honey.",ingredients:["Giarratana Onions (70%)","Extra Virgin Olive Oil","White Wine Vinegar","Wildflower Honey","Bay Leaves"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhdQeQX7-eWdI3_cipolla_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhdgeQX7-eWdI4_cipolla-in-agrodolce_result.webp?auto=format,compress"},{id:"pera_cannella",slug:"pera_cannella",title:"Coscia Pear & Ceylon Cinnamon",latinSubtitle:"Pyrus Communis Cinnamomum",category:"sweet",price:"€7.20",weight:"240g ℮",origin:"Maniace, Mount Etna",description:"Tender sugary Coscia pears from high Etna groves infused with freshly cold-ground Ceylon cinnamon quills.",ingredients:["Etna Coscia Pears (75%)","Raw Cane Sugar","Ceylon Cinnamon (1%)","Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhgQeQX7-eWdJD_pera_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhggeQX7-eWdJE_pera_result-1.webp?auto=format,compress"}];class j{wrapper;track;badge;products;onSelectProduct;onUpdateTelemetry;targetX=0;currentX=0;lerpFactor=.085;itemWidth=220;itemSpacing=40;effectiveItemWidth=260;trackWidth=2600;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetX=0;lastClientX=0;lastTime=0;dragVelocity=0;velocity=0;items=[];isRunning=!0;boundEvents=[];constructor(t){this.wrapper=t.wrapper,this.track=t.track,this.badge=t.badge||null,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.onUpdateTelemetry=t.onUpdateTelemetry;const i=t.inclineAngle!==void 0?t.inclineAngle:10;document.documentElement.style.setProperty("--jar-marquee-angle",`${i}deg`),this.initDOM(),this.updateDimensions(),this.bindEvents(),this.loop=this.loop.bind(this),requestAnimationFrame(this.loop)}initDOM(){this.track.innerHTML="",this.items=[],this.products.forEach((t,i)=>{const e=document.createElement("a");e.className="jar-slider__item",e.href=`/dispensa/${t.slug}`,e.setAttribute("aria-label",t.title),e.dataset.index=i.toString(),e.dataset.id=t.id,e.innerHTML=`
        <img class="jar-slider__base" src="${t.jarUrl}" alt="${t.title}" loading="eager" />
        <canvas class="jar-slider__label" width="300" height="180" aria-hidden="true"></canvas>
      `,this.track.appendChild(e);const s=e.querySelector(".jar-slider__label");if(!s)return;const a=s.getContext("2d");if(!a)return;const r={element:e,canvas:s,ctx:a,product:t,index:i,labelLoaded:!1};if(t.labelUrl){const l=new Image;l.crossOrigin="anonymous",l.src=t.labelUrl,l.onload=()=>{r.labelLoaded=!0,r.labelImg=l,this.renderCylindricalLabel(r,this.currentX)}}this.items.push(r),this.renderCylindricalLabel(r,0)})}updateDimensions(){const t=this.items[0]?.element;t&&t.offsetWidth>0?this.itemWidth=t.offsetWidth:this.itemWidth=window.innerWidth<=768?160:200,this.itemSpacing=Math.max(30,Math.round(window.innerWidth*.035)),this.effectiveItemWidth=this.itemWidth+this.itemSpacing,this.trackWidth=this.products.length*this.effectiveItemWidth}renderCylindricalLabel(t,i){const e=t.ctx,s=t.canvas.width,a=t.canvas.height,r=t.product;e.clearRect(0,0,s,a);const l=Math.sin(i*.0025+t.index*.6)*16;if(t.labelLoaded&&t.labelImg){e.save(),e.drawImage(t.labelImg,l,0,s,a);const c=e.createLinearGradient(0,0,s,0);c.addColorStop(0,"rgba(0, 0, 0, 0.42)"),c.addColorStop(.18,"rgba(0, 0, 0, 0.08)"),c.addColorStop(.5,"rgba(255, 255, 255, 0.25)"),c.addColorStop(.82,"rgba(0, 0, 0, 0.08)"),c.addColorStop(1,"rgba(0, 0, 0, 0.45)"),e.fillStyle=c,e.fillRect(0,0,s,a),e.restore()}else{e.save();const c=r.category==="sweet"?"#d44213":r.category==="spread"?"#4a5d23":"#762530";e.fillStyle=c,e.beginPath(),e.roundRect(0,0,s,a,6),e.fill(),e.strokeStyle="#e6c89f",e.lineWidth=2.5,e.strokeRect(6,6,s-12,a-12),e.textAlign="center",e.fillStyle="#fdf3eb",e.font='600 10px "Plus Jakarta Sans", sans-serif',e.fillText("AGRUMÊA FARM • SICILY",s/2+l*.5,36),e.font='700 15px "Cinzel", serif',e.fillText(r.title,s/2+l,72),e.font='italic 11px "Plus Jakarta Sans", sans-serif',e.fillText(r.latinSubtitle,s/2+l*.8,102),e.font='600 10px "Plus Jakarta Sans", sans-serif',e.fillText(`${r.weight} • ${r.origin.split(",")[0]}`,s/2+l*.5,142);const n=e.createLinearGradient(0,0,s,0);n.addColorStop(0,"rgba(0, 0, 0, 0.42)"),n.addColorStop(.2,"rgba(0, 0, 0, 0.05)"),n.addColorStop(.5,"rgba(255, 255, 255, 0.22)"),n.addColorStop(.8,"rgba(0, 0, 0, 0.05)"),n.addColorStop(1,"rgba(0, 0, 0, 0.45)"),e.fillStyle=n,e.fillRect(0,0,s,a),e.restore()}}addTrackedListener(t,i,e,s){t.addEventListener(i,e,s),this.boundEvents.push({target:t,type:i,handler:e})}bindEvents(){const t=a=>{if(document.body.classList.contains("is-nav-open"))return;this.isDragging=!0,this.hasDragged=!1;const r="touches"in a?a.touches[0].clientX:a.clientX,l="touches"in a?a.touches[0].clientY:a.clientY;this.startClientX=r,this.startClientY=l,this.startTargetX=this.targetX,this.lastClientX=r,this.lastTime=performance.now(),this.dragVelocity=0,document.body.classList.add("grabbing")},i=a=>{if(!this.isDragging||document.body.classList.contains("is-nav-open"))return;const r="touches"in a?a.touches[0].clientX:a.clientX,l="touches"in a?a.touches[0].clientY:a.clientY;Math.hypot(r-this.startClientX,l-this.startClientY)>8&&(this.hasDragged=!0);const n=r-this.startClientX;this.targetX=this.startTargetX+n*1.35;const h=performance.now(),d=Math.max(h-this.lastTime,12);this.dragVelocity=(r-this.lastClientX)/d,this.lastClientX=r,this.lastTime=h},e=()=>{this.isDragging&&(this.isDragging=!1,document.body.classList.remove("grabbing"),Math.abs(this.dragVelocity)>.1&&(this.targetX+=this.dragVelocity*200))};this.addTrackedListener(this.wrapper,"mousedown",t),this.addTrackedListener(window,"mousemove",i),this.addTrackedListener(window,"mouseup",e),this.addTrackedListener(this.wrapper,"touchstart",t,{passive:!0}),this.addTrackedListener(window,"touchmove",i,{passive:!0}),this.addTrackedListener(window,"touchend",e),this.addTrackedListener(this.wrapper,"wheel",(a=>{if(document.body.classList.contains("is-nav-open"))return;a.preventDefault();const r=Math.abs(a.deltaX)>Math.abs(a.deltaY)?a.deltaX:a.deltaY;this.targetX-=r*1.5}),{passive:!1});let s;this.addTrackedListener(window,"resize",()=>{clearTimeout(s),s=window.setTimeout(()=>this.updateDimensions(),100)}),this.items.forEach(a=>{this.addTrackedListener(a.element,"click",(r=>{if(this.hasDragged||Math.abs(this.velocity)>.8){r.preventDefault(),r.stopPropagation();return}this.onSelectProduct&&(r.preventDefault(),this.onSelectProduct(a.product))}))})}loop(){if(!this.isRunning)return;const t=this.currentX;this.currentX+=(this.targetX-this.currentX)*this.lerpFactor,this.velocity=this.currentX-t;const i=window.innerWidth/2,e=Math.abs(this.velocity)>.005;this.items.forEach(a=>{let l=((this.currentX+a.index*this.effectiveItemWidth)%this.trackWidth+this.trackWidth)%this.trackWidth;l-=this.trackWidth/2-i;const c=Math.abs(l-i),n=Math.min(c/(window.innerWidth*.7),1),h=1-n*.12,d=1-Math.pow(n,3)*.6;a.element.style.transform=`translate3d(${l}px, 0, 0) scale(${h})`,a.element.style.opacity=d.toString(),e&&this.renderCylindricalLabel(a,this.currentX)});const s=this.currentX*-.06%360;document.documentElement.style.setProperty("--jar-circle-rotation",`${s}deg`),this.onUpdateTelemetry&&this.onUpdateTelemetry({velocity:Math.abs(this.velocity),rotation:s}),requestAnimationFrame(this.loop)}destroy(){this.isRunning=!1,this.boundEvents.forEach(({target:t,type:i,handler:e})=>{t.removeEventListener(i,e)}),this.boundEvents=[]}}class G{container;products;onSelectProduct;wrapper;canvas;gl=null;program=null;trackEl;cardElements=[];targetX=0;currentX=0;velocity=0;lerpFactor=.085;startTime=performance.now();cardWidth=280;cardSpacing=44;effectiveWidth;trackWidth;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetX=0;lastClientX=0;lastTime=0;dragVelocity=0;uTimeLoc=null;uVelocityLoc=null;uResolutionLoc=null;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.effectiveWidth=this.cardWidth+this.cardSpacing,this.trackWidth=this.products.length*this.effectiveWidth,this.buildDOM(),this.initWebGL(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="liquid-carousel",this.wrapper.style.cssText=`
      position: absolute;
      inset: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      user-select: none;
      touch-action: none;
    `,this.canvas=document.createElement("canvas"),this.canvas.className="liquid-carousel__canvas",this.canvas.style.cssText=`
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.9;
    `,this.wrapper.appendChild(this.canvas);const t=document.createElement("div");t.className="liquid-carousel__header",t.style.cssText=`
      position: absolute;
      top: clamp(80px, 14vh, 120px);
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 10;
      pointer-events: none;
    `,t.innerHTML=`
      <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.25em; text-transform:uppercase; color:#E94E1B;">
        GLSL Liquid Shader • Drag or Wheel to Disperse
      </span>
      <h2 style="font-family:'Cinzel',serif; font-size:clamp(1.4rem, 2.5vw, 2.2rem); font-weight:600; color:#762530; margin:6px 0 0;">
        Viscous Fluid Dispersion
      </h2>
    `,this.wrapper.appendChild(t);const i=document.createElement("div");i.className="liquid-carousel__stage",i.style.cssText=`
      position: relative;
      width: 100%;
      height: 520px;
      z-index: 5;
      overflow: visible;
      cursor: grab;
    `,this.trackEl=document.createElement("div"),this.trackEl.className="liquid-carousel__track",this.trackEl.style.cssText=`
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `,i.appendChild(this.trackEl),this.wrapper.appendChild(i),this.cardElements=this.products.map((e,s)=>{const a=document.createElement("div");return a.className="liquid-card",a.dataset.index=String(s),a.style.cssText=`
        position: absolute;
        top: 50%;
        left: 0;
        width: ${this.cardWidth}px;
        height: 440px;
        margin-top: -220px;
        border-radius: 26px;
        background: rgba(253, 243, 235, 0.95);
        border: 1px solid rgba(118, 37, 48, 0.28);
        box-shadow: 0 20px 45px rgba(38, 22, 18, 0.12), 0 2px 8px rgba(38, 22, 18, 0.06);
        cursor: pointer;
        will-change: transform, filter, opacity;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 22px;
        box-sizing: border-box;
        overflow: hidden;
        backdrop-filter: blur(12px);
      `,a.innerHTML=`
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#E94E1B;">
            ${e.category.toUpperCase()}
          </span>
          <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:11px; font-weight:600; color:#7d6b64;">
            ${e.weight}
          </span>
        </div>

        <div class="liquid-card__jar-stage" style="flex:1; display:flex; justify-content:center; align-items:center; position:relative; padding:10px 0;">
          <img class="liquid-card__jar-img" src="${e.jarUrl}" alt="${e.title}" draggable="false" style="max-height:220px; width:auto; object-fit:contain; filter:drop-shadow(0 14px 20px rgba(118, 37, 48, 0.22)); transition:transform 0.35s ease;" />
        </div>

        <div style="text-align:center;">
          <h3 style="font-family:'Cinzel',serif; font-size:1.15rem; font-weight:600; color:#762530; margin:0 0 2px;">
            ${e.title}
          </h3>
          <p style="font-family:'Cinzel',serif; font-size:0.8rem; font-style:italic; color:#7d6b64; margin:0 0 10px;">
            ${e.latinSubtitle}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(118,37,48,0.12); padding-top:10px;">
            <span style="font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; color:#E94E1B;">
              ${e.price}
            </span>
            <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#762530;">
              View Blend →
            </span>
          </div>
        </div>
      `,this.trackEl.appendChild(a),a}),this.container.appendChild(this.wrapper)}initWebGL(){const t=this.canvas.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!1});if(!t){console.warn("WebGL not available for liquid canvas");return}this.gl=t;const i=`
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,e=`
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_velocity;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = v_uv;
        
        // Fluid gel wave distortion
        float speed = u_time * 1.8;
        float wave1 = sin(uv.x * 6.0 + speed) * cos(uv.y * 6.0 + speed * 0.8);
        float wave2 = sin(uv.x * 12.0 - speed * 1.2 + u_velocity * 0.5) * 0.5;
        float fluid = wave1 + wave2;

        // Viscous caustics intensity
        float caustic = pow(sin(fluid * 3.14159), 2.0) * 0.18;

        // Rich Sicilian Wine & Terracotta Gel Colors
        vec3 colorWine = vec3(0.46, 0.14, 0.18);   // #762530
        vec3 colorAmber = vec3(0.91, 0.31, 0.11);  // #E94E1B
        vec3 colorCream = vec3(0.99, 0.95, 0.92);  // #FDF3EB

        // Dynamic color blend based on velocity & caustics
        float vNorm = clamp(abs(u_velocity) * 0.12, 0.0, 1.0);
        vec3 gelColor = mix(colorWine, colorAmber, caustic + vNorm);

        // Alpha vignette around center stage
        float dist = distance(uv, vec2(0.5, 0.5));
        float alpha = smoothstep(0.7, 0.2, dist) * (0.28 + vNorm * 0.35 + caustic * 0.25);

        gl_FragColor = vec4(gelColor, alpha);
      }
    `,s=t.createShader(t.VERTEX_SHADER);t.shaderSource(s,i),t.compileShader(s);const a=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(a,e),t.compileShader(a);const r=t.createProgram();if(t.attachShader(r,s),t.attachShader(r,a),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS)){console.warn("GLSL failed to link:",t.getProgramInfoLog(r));return}this.program=r,t.useProgram(r);const l=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,l),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);const c=t.getAttribLocation(r,"a_position");t.enableVertexAttribArray(c),t.vertexAttribPointer(c,2,t.FLOAT,!1,0,0),this.uTimeLoc=t.getUniformLocation(r,"u_time"),this.uVelocityLoc=t.getUniformLocation(r,"u_velocity"),this.uResolutionLoc=t.getUniformLocation(r,"u_resolution"),this.resizeCanvas()}resizeCanvas(){if(!this.canvas||!this.gl)return;const t=Math.min(window.devicePixelRatio||1,2),i=this.wrapper.clientWidth||window.innerWidth,e=this.wrapper.clientHeight||window.innerHeight;this.canvas.width=i*t,this.canvas.height=e*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}bindEvents(){const t=s=>{if(document.body.classList.contains("is-nav-open"))return;this.isDragging=!0,this.hasDragged=!1;const a="touches"in s?s.touches[0].clientX:s.clientX,r="touches"in s?s.touches[0].clientY:s.clientY;this.startClientX=a,this.startClientY=r,this.startTargetX=this.targetX,this.lastClientX=a,this.lastTime=performance.now(),this.dragVelocity=0,this.trackEl.style.cursor="grabbing"},i=s=>{if(!this.isDragging)return;const a="touches"in s?s.touches[0].clientX:s.clientX,r="touches"in s?s.touches[0].clientY:s.clientY;Math.hypot(a-this.startClientX,r-this.startClientY)>8&&(this.hasDragged=!0);const c=a-this.startClientX;this.targetX=this.startTargetX+c*1.35;const n=performance.now(),h=Math.max(n-this.lastTime,12);this.dragVelocity=(a-this.lastClientX)/h,this.lastClientX=a,this.lastTime=n},e=()=>{this.isDragging&&(this.isDragging=!1,this.trackEl.style.cursor="grab",Math.abs(this.dragVelocity)>.1&&(this.targetX+=this.dragVelocity*220))};this.addTrackedListener(this.trackEl,"mousedown",t),this.addTrackedListener(window,"mousemove",i),this.addTrackedListener(window,"mouseup",e),this.addTrackedListener(this.trackEl,"touchstart",t,{passive:!0}),this.addTrackedListener(window,"touchmove",i,{passive:!0}),this.addTrackedListener(window,"touchend",e),this.addTrackedListener(this.trackEl,"wheel",(s=>{s.preventDefault();const a=Math.abs(s.deltaX)>Math.abs(s.deltaY)?s.deltaX:s.deltaY;this.targetX-=a*1.5}),{passive:!1}),this.addTrackedListener(window,"resize",()=>this.resizeCanvas()),this.cardElements.forEach((s,a)=>{this.addTrackedListener(s,"click",r=>{this.hasDragged||Math.abs(this.velocity)>.8||this.onSelectProduct&&(r.preventDefault(),this.onSelectProduct(this.products[a]))})})}addTrackedListener(t,i,e,s){t.addEventListener(i,e,s),this.boundEvents.push({target:t,type:i,handler:e})}loop(){if(!this.isRunning)return;const t=this.currentX;if(this.currentX+=(this.targetX-this.currentX)*this.lerpFactor,this.velocity=this.currentX-t,this.gl&&this.program){const a=this.gl;a.useProgram(this.program);const r=(performance.now()-this.startTime)*.001;this.uTimeLoc&&a.uniform1f(this.uTimeLoc,r),this.uVelocityLoc&&a.uniform1f(this.uVelocityLoc,this.velocity),this.uResolutionLoc&&a.uniform2f(this.uResolutionLoc,this.canvas.width,this.canvas.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.drawArrays(a.TRIANGLES,0,6)}const i=window.innerWidth/2,e=Math.max(-12,Math.min(12,this.velocity)),s=e*1.8;this.cardElements.forEach((a,r)=>{let c=((this.currentX+r*this.effectiveWidth)%this.trackWidth+this.trackWidth)%this.trackWidth;c-=this.trackWidth/2-i;const n=Math.abs(c-i),h=Math.min(n/(window.innerWidth*.7),1),d=1-h*.12,p=1-Math.pow(h,3)*.65,u=Math.sin(c*.0035+performance.now()*.002)*16+Math.abs(e)*2.5,g=e*-.9,m=(c-i)*.015;a.style.transform=`translate3d(${c}px, ${u}px, 0) scale(${d}) skewX(${g}deg) rotate(${m}deg)`,a.style.opacity=p.toString(),Math.abs(e)>.4?a.style.boxShadow=`
          ${s}px 0 18px rgba(233, 78, 27, 0.45),
          ${-s}px 0 18px rgba(0, 180, 216, 0.35),
          0 20px 45px rgba(38, 22, 18, 0.15)
        `:a.style.boxShadow="0 20px 45px rgba(38, 22, 18, 0.12), 0 2px 8px rgba(38, 22, 18, 0.06)"}),this.animationFrameId=requestAnimationFrame(this.loop)}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),this.boundEvents.forEach(({target:t,type:i,handler:e})=>{t.removeEventListener(i,e)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentNode&&this.wrapper.parentNode.removeChild(this.wrapper)}}class Z{container;products;onSelectProduct;wrapper;cardStack;cardElements=[];currentIndex=0;isDragging=!1;hasDragged=!1;startX=0;startY=0;currentX=0;currentY=0;lastX=0;lastTime=0;velocityX=0;counterEl;prevBtn;nextBtn;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.buildDOM(),this.renderStack(),this.bindEvents()}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="deck-carousel",this.wrapper.innerHTML=`
      <div class="deck-carousel__header">
        <span class="deck-carousel__tag">Tactile Card Deck • Swipe or Flick</span>
        <div class="deck-carousel__counter" id="deckCounter">01 / ${String(this.products.length).padStart(2,"0")}</div>
      </div>

      <div class="deck-carousel__stage">
        <div class="deck-carousel__stack" id="cardStack"></div>
      </div>

      <div class="deck-carousel__controls">
        <button class="deck-carousel__btn deck-carousel__btn--prev" id="deckPrev" aria-label="Previous card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="deck-carousel__hint">Drag to peel or throw card</div>
        <button class="deck-carousel__btn deck-carousel__btn--next" id="deckNext" aria-label="Next card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    `,this.container.appendChild(this.wrapper),this.cardStack=this.wrapper.querySelector("#cardStack"),this.counterEl=this.wrapper.querySelector("#deckCounter"),this.prevBtn=this.wrapper.querySelector("#deckPrev"),this.nextBtn=this.wrapper.querySelector("#deckNext"),this.cardElements=this.products.map((t,i)=>{const e=document.createElement("div");return e.className="deck-card",e.dataset.index=String(i),e.innerHTML=`
        <div class="deck-card__inner">
          <div class="deck-card__badge-row">
            <span class="deck-card__category">${t.category.toUpperCase()}</span>
            <span class="deck-card__weight">${t.weight}</span>
          </div>
          
          <div class="deck-card__jar-stage">
            <img class="deck-card__jar-img" src="${t.jarUrl}" alt="${t.title}" draggable="false" />
            <div class="deck-card__jar-shadow"></div>
          </div>

          <div class="deck-card__content">
            <h3 class="deck-card__title">${t.title}</h3>
            <p class="deck-card__subtitle">${t.latinSubtitle}</p>
            <p class="deck-card__desc">${t.description}</p>
            
            <div class="deck-card__footer">
              <span class="deck-card__price">${t.price}</span>
              <span class="deck-card__cta">Explore Flavor →</span>
            </div>
          </div>
        </div>
      `,this.cardStack.appendChild(e),e})}renderStack(t=!1){const i=this.products.length;this.counterEl.textContent=`${String(this.currentIndex+1).padStart(2,"0")} / ${String(i).padStart(2,"0")}`,this.cardElements.forEach((e,s)=>{const a=(s-this.currentIndex+i)%i;e.style.transition=t?"transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease":"none",a===0?(e.style.transform="translate3d(0, 0, 0) scale(1) rotate(0deg)",e.style.opacity="1",e.style.zIndex="10",e.style.pointerEvents="auto",e.classList.add("is-active")):a===1?(e.style.transform="translate3d(0, 22px, -40px) scale(0.95)",e.style.opacity="0.9",e.style.zIndex="9",e.style.pointerEvents="none",e.classList.remove("is-active")):a===2?(e.style.transform="translate3d(0, 44px, -80px) scale(0.90)",e.style.opacity="0.65",e.style.zIndex="8",e.style.pointerEvents="none",e.classList.remove("is-active")):a===3?(e.style.transform="translate3d(0, 66px, -120px) scale(0.85)",e.style.opacity="0.35",e.style.zIndex="7",e.style.pointerEvents="none",e.classList.remove("is-active")):(e.style.transform="translate3d(0, 80px, -160px) scale(0.80)",e.style.opacity="0",e.style.zIndex="1",e.style.pointerEvents="none",e.classList.remove("is-active"))})}bindEvents(){const t=()=>this.cardElements[this.currentIndex],i=a=>{const r=t();if(!r)return;this.isDragging=!0,this.hasDragged=!1;const l="touches"in a?a.touches[0].clientX:a.clientX,c="touches"in a?a.touches[0].clientY:a.clientY;this.startX=l,this.startY=c,this.currentX=0,this.currentY=0,this.lastX=l,this.lastTime=performance.now(),this.velocityX=0,r.style.transition="none",r.style.cursor="grabbing"},e=a=>{if(!this.isDragging)return;const r="touches"in a?a.touches[0].clientX:a.clientX,l="touches"in a?a.touches[0].clientY:a.clientY;this.currentX=r-this.startX,this.currentY=l-this.startY,Math.hypot(this.currentX,this.currentY)>8&&(this.hasDragged=!0);const c=performance.now(),n=Math.max(c-this.lastTime,12);this.velocityX=(r-this.lastX)/n,this.lastX=r,this.lastTime=c;const h=t();if(h){const u=this.currentX*.08;h.style.transform=`translate3d(${this.currentX}px, ${this.currentY}px, 0) rotate(${u}deg) scale(1.02)`}const d=Math.min(Math.abs(this.currentX)/220,1),p=this.cardElements[(this.currentIndex+1)%this.products.length];if(p){const u=.95+d*.05,g=22-d*22;p.style.transform=`translate3d(0, ${g}px, -40px) scale(${u})`}},s=()=>{if(!this.isDragging)return;this.isDragging=!1;const a=t();if(!a)return;if(a.style.cursor="grab",Math.abs(this.currentX)>110||Math.abs(this.velocityX)>.4){const l=this.currentX>=0?1:-1,c=l*(window.innerWidth*.85);a.style.transition="transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.35s ease",a.style.transform=`translate3d(${c}px, ${this.currentY*1.5}px, 50px) rotate(${l*28}deg)`,a.style.opacity="0",setTimeout(()=>{this.currentIndex=(this.currentIndex+1)%this.products.length,this.renderStack(!0)},220)}else{a.style.transition="transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",a.style.transform="translate3d(0, 0, 0) scale(1) rotate(0deg)";const l=this.cardElements[(this.currentIndex+1)%this.products.length];l&&(l.style.transition="transform 0.45s ease",l.style.transform="translate3d(0, 22px, -40px) scale(0.95)")}};this.addTrackedListener(this.cardStack,"mousedown",i),this.addTrackedListener(window,"mousemove",e),this.addTrackedListener(window,"mouseup",s),this.addTrackedListener(this.cardStack,"touchstart",i,{passive:!0}),this.addTrackedListener(window,"touchmove",e,{passive:!0}),this.addTrackedListener(window,"touchend",s),this.addTrackedListener(this.nextBtn,"click",()=>{this.throwCurrentCard(1)}),this.addTrackedListener(this.prevBtn,"click",()=>{this.throwCurrentCard(-1)}),this.cardElements.forEach((a,r)=>{this.addTrackedListener(a,"click",l=>{this.hasDragged||r===this.currentIndex&&this.onSelectProduct&&(l.preventDefault(),this.onSelectProduct(this.products[r]))})})}throwCurrentCard(t){const i=this.cardElements[this.currentIndex];i&&(i.style.transition="transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.35s ease",i.style.transform=`translate3d(${t*650}px, -40px, 50px) rotate(${t*22}deg)`,i.style.opacity="0",setTimeout(()=>{const e=this.products.length;this.currentIndex=t>0?(this.currentIndex+1)%e:(this.currentIndex-1+e)%e,this.renderStack(!0)},200))}addTrackedListener(t,i,e,s){t.addEventListener(i,e,s),this.boundEvents.push({target:t,type:i,handler:e})}destroy(){this.boundEvents.forEach(({target:t,type:i,handler:e})=>{t.removeEventListener(i,e)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentNode&&this.wrapper.parentNode.removeChild(this.wrapper)}}class Q{container;products;onSelectProduct;wrapper;canvas;ctx=null;ribbonStage;cardElements=[];hudCounter;hudTitleParallax;progressBar;angle=0;targetAngle=0;velocity=0;lastAngle=0;numItems;angleStep;radiusY=520;radiusZ=450;lerpFactor=.075;mouseX=0;mouseY=0;targetMouseX=0;targetMouseY=0;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetAngle=0;lastClientY=0;lastDragTime=0;dragVelocity=0;particles=[];numParticles=100;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.numItems=this.products.length,this.angleStep=Math.PI*2/this.numItems,this.buildDOM(),this.initCanvas(),this.initParticles(),this.updateDimensions(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="at-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Active Theory Vertical 3D Tunnel Showcase"),this.wrapper.innerHTML=`
      <!-- Dynamic Atmospheric Particle & Depth Corridor Canvas -->
      <canvas class="at-canvas" id="atCanvas" aria-hidden="true"></canvas>

      <!-- Background Cinematic Parallax Typography (Vertical Stack) -->
      <div class="at-bg-typography at-bg-typography--vertical" aria-hidden="true">
        <div class="at-bg-typography__track" id="atParallaxTrack">
          <div class="at-bg-typography__text">AGRUMÊA ARCHIVE</div>
          <div class="at-bg-typography__text">VOLCANIC TERROIR</div>
          <div class="at-bg-typography__text">SICILIAN BOTANICAL</div>
          <div class="at-bg-typography__text">DISPENSA ETNA</div>
        </div>
      </div>

      <!-- Top Active Theory Telemetry HUD -->
      <header class="at-hud-top" aria-hidden="true">
        <div class="at-hud-cell">
          <span class="at-hud-dot"></span>
          <span class="at-hud-label">EXP // 04</span>
          <span class="at-hud-val">ACTIVE THEORY 3D TUNNEL</span>
        </div>
        <div class="at-hud-cell at-hud-cell--coords">
          <span class="at-hud-label">COORDS</span>
          <span class="at-hud-val" id="atCoordsText">37.5079° N, 15.0873° E // ETNA TERROIR</span>
        </div>
        <div class="at-hud-cell at-hud-cell--index">
          <span class="at-hud-label">INDEX</span>
          <span class="at-hud-val" id="atCounter">01 / ${String(this.numItems).padStart(2,"0")}</span>
        </div>
      </header>

      <!-- 3D Viewport & Vertical Ribbon Stage -->
      <div class="at-viewport" id="atViewport">
        <div class="at-ribbon at-ribbon--vertical" id="atRibbon">
          <!-- Cards injected dynamically -->
        </div>
      </div>

      <!-- Bottom HUD & Vertical Tunnel Controls -->
      <footer class="at-hud-bottom">
        <div class="at-scrub-controls">
          <button class="at-nav-btn at-nav-btn--prev" id="atPrevBtn" aria-label="Previous product (Scroll Up)" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            <span>PREV</span>
          </button>
          
          <div class="at-scrub-rail" id="atScrubRail" role="slider" aria-label="Tunnel Depth Scrubber" aria-valuemin="1" aria-valuemax="${this.numItems}" aria-valuenow="1" tabindex="0">
            <div class="at-scrub-track"></div>
            <div class="at-scrub-thumb" id="atProgressBar"></div>
          </div>

          <button class="at-nav-btn at-nav-btn--next" id="atNextBtn" aria-label="Next product (Scroll Down)" type="button">
            <span>NEXT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
        </div>

        <div class="at-hud-footer-info" aria-hidden="true">
          <span class="at-hint-text">VERTICAL SCROLL // SWIPE UP TO DIVE</span>
          <span class="at-status-badge">HYDRA // SPATIAL MATRIX</span>
        </div>
      </footer>
    `,this.container.appendChild(this.wrapper),this.canvas=this.wrapper.querySelector("#atCanvas"),this.ribbonStage=this.wrapper.querySelector("#atRibbon"),this.hudCounter=this.wrapper.querySelector("#atCounter"),this.hudTitleParallax=this.wrapper.querySelector("#atParallaxTrack"),this.progressBar=this.wrapper.querySelector("#atProgressBar"),this.products.forEach((t,i)=>{const e=document.createElement("article");e.className="at-card",e.dataset.index=String(i),e.dataset.slug=t.slug;const s=String(i+1).padStart(2,"0"),a=t.category.toUpperCase();e.innerHTML=`
        <div class="at-card__inner">
          <!-- Cyber Monolith Reticle Corners -->
          <div class="at-card__bracket at-card__bracket--tl" aria-hidden="true"></div>
          <div class="at-card__bracket at-card__bracket--tr" aria-hidden="true"></div>
          <div class="at-card__bracket at-card__bracket--bl" aria-hidden="true"></div>
          <div class="at-card__bracket at-card__bracket--br" aria-hidden="true"></div>

          <!-- Card Top Bar -->
          <div class="at-card__header">
            <span class="at-card__sec-id">SEC // ${s}</span>
            <span class="at-card__category">${a}</span>
            <span class="at-card__weight">${t.weight}</span>
          </div>

          <!-- Floating 3D Jar Cutout -->
          <div class="at-card__jar-stage">
            <div class="at-card__ambient-glow"></div>
            <img 
              class="at-card__jar-img" 
              src="${t.jarUrl}" 
              alt="${t.title}" 
              loading="${i<4?"eager":"lazy"}" 
              decoding="async"
              draggable="false"
            />
          </div>

          <!-- Editorial Card Metadata -->
          <div class="at-card__meta">
            <div class="at-card__origin">${t.origin}</div>
            <h2 class="at-card__title">${t.title}</h2>
            <p class="at-card__sub">${t.latinSubtitle}</p>
          </div>

          <!-- Card Bottom Interactive Trigger -->
          <div class="at-card__footer">
            <span class="at-card__price">${t.price}</span>
            <div class="at-card__cta">
              <span>EXPLORE</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </div>
          </div>
        </div>
      `,e.addEventListener("click",r=>{if(this.hasDragged){r.preventDefault();return}const l=this.getActiveIndex();i===l?this.onSelectProduct&&this.onSelectProduct(t):this.snapToIndex(i)}),this.ribbonStage.appendChild(e),this.cardElements.push(e)})}initCanvas(){this.ctx=this.canvas.getContext("2d",{alpha:!0}),this.resizeCanvas()}resizeCanvas(){if(!this.canvas)return;const t=Math.min(window.devicePixelRatio||1,2),i=this.wrapper.getBoundingClientRect(),e=i.width||window.innerWidth,s=i.height||window.innerHeight;this.canvas.width=Math.floor(e*t),this.canvas.height=Math.floor(s*t),this.canvas.style.width=`${e}px`,this.canvas.style.height=`${s}px`,this.ctx&&this.ctx.setTransform(t,0,0,t,0,0)}initParticles(){this.particles=[];const t=window.innerWidth,i=window.innerHeight;for(let e=0;e<this.numParticles;e++){const s=(Math.random()-.5)*t*1.5,a=(Math.random()-.5)*i*1.8,r=Math.random()*1e3+40;this.particles.push({x:s,y:a,z:r,baseX:s,baseY:a,size:Math.random()*2+1,speedZ:Math.random()*1.3+.4,alpha:Math.random()*.75+.2})}}updateDimensions(){const t=window.innerHeight;t<700?(this.radiusY=400,this.radiusZ=360):t<900?(this.radiusY=480,this.radiusZ=420):(this.radiusY=Math.min(580,t*.52),this.radiusZ=460)}bindEvents(){const t=(d,p,u,g)=>{d.addEventListener(p,u,g),this.boundEvents.push({target:d,type:p,handler:u,options:g})},i=d=>{if(!d.target.closest("button, .at-scrub-rail")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=d.clientX,this.startClientY=d.clientY,this.lastClientY=d.clientY,this.lastDragTime=performance.now(),this.startTargetAngle=this.targetAngle,this.dragVelocity=0;try{d.target.setPointerCapture(d.pointerId)}catch{}}},e=d=>{const p=this.wrapper.getBoundingClientRect(),u=(d.clientX-p.left)/p.width-.5,g=(d.clientY-p.top)/p.height-.5;if(this.targetMouseX=u*2,this.targetMouseY=g*2,!this.isDragging)return;const m=d.clientX-this.startClientX,v=d.clientY-this.startClientY;!this.hasDragged&&(Math.abs(v)>5||Math.abs(m)>5)&&(this.hasDragged=!0);const f=v/(this.radiusY*.95);this.targetAngle=this.startTargetAngle+f;const b=performance.now(),w=Math.max(1,b-this.lastDragTime),S=d.clientY-this.lastClientY;this.dragVelocity=S/w*16.67,this.lastClientY=d.clientY,this.lastDragTime=b},s=d=>{if(this.isDragging){this.isDragging=!1;try{d.target.releasePointerCapture(d.pointerId)}catch{}if(!this.hasDragged){const p=d.target.closest(".at-card");if(p&&p.dataset.index){const u=parseInt(p.dataset.index,10),g=this.getActiveIndex();u===g?this.onSelectProduct&&this.products[u]&&this.onSelectProduct(this.products[u]):this.snapToIndex(u)}}if(Math.abs(this.dragVelocity)>2){const p=this.dragVelocity/this.radiusY*.85;this.targetAngle+=p}}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=d=>{d.preventDefault();const p=d.deltaY,u=.0022;this.targetAngle-=p*u};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",d=>{d.key==="ArrowUp"||d.key==="ArrowLeft"?(d.preventDefault(),this.stepBy(-1)):(d.key==="ArrowDown"||d.key==="ArrowRight")&&(d.preventDefault(),this.stepBy(1))});const l=this.wrapper.querySelector("#atPrevBtn"),c=this.wrapper.querySelector("#atNextBtn");l&&t(l,"click",()=>this.stepBy(-1)),c&&t(c,"click",()=>this.stepBy(1));const n=this.wrapper.querySelector("#atScrubRail");if(n){let d=!1;const p=u=>{const g=n.getBoundingClientRect(),m=Math.max(0,Math.min(1,(u-g.left)/g.width)),v=Math.round(m*(this.numItems-1));this.snapToIndex(v)};t(n,"pointerdown",u=>{d=!0,p(u.clientX)}),t(window,"pointermove",u=>{if(!d)return;p(u.clientX)}),t(window,"pointerup",()=>{d=!1})}t(window,"resize",()=>{this.resizeCanvas(),this.updateDimensions()})}stepBy(t){const e=(this.getActiveIndex()+t+this.numItems)%this.numItems;this.snapToIndex(e)}snapToIndex(t){const i=-t*this.angleStep,e=Math.round(this.targetAngle/(Math.PI*2));let s=i+e*(Math.PI*2);const a=s-this.targetAngle;a>Math.PI&&(s-=Math.PI*2),a<-Math.PI&&(s+=Math.PI*2),this.targetAngle=s}getActiveIndex(){const i=(-this.angle/this.angleStep%this.numItems+this.numItems)%this.numItems;return Math.round(i)%this.numItems}loop(){this.isRunning&&(this.angle+=(this.targetAngle-this.angle)*this.lerpFactor,this.velocity=(this.angle-this.lastAngle)*60,this.lastAngle=this.angle,this.mouseX+=(this.targetMouseX-this.mouseX)*.08,this.mouseY+=(this.targetMouseY-this.mouseY)*.08,this.renderCanvas(),this.renderRibbon(),this.renderHUD(),this.animationFrameId=requestAnimationFrame(this.loop))}renderCanvas(){if(!this.ctx||!this.canvas)return;const t=this.ctx,i=this.canvas.width/(window.devicePixelRatio||1),e=this.canvas.height/(window.devicePixelRatio||1),s=i*.5,a=e*.5;t.clearRect(0,0,i,e),t.save(),t.lineWidth=1,t.strokeStyle="rgba(229, 90, 43, 0.08)";const r=s+this.mouseX*35,l=a+this.mouseY*20,c=12;for(let h=0;h<=c;h++){const d=h/c*i;t.beginPath(),t.moveTo(r,l),t.lineTo(d,0),t.stroke()}for(let h=0;h<=c;h++){const d=h/c*i;t.beginPath(),t.moveTo(r,l),t.lineTo(d,e),t.stroke()}for(let h=1;h<=5;h++){const d=h/5,p=i*Math.pow(d,1.8),u=e*Math.pow(d,1.8);t.strokeRect(s-p*.5,a-u*.5,p,u)}t.restore();const n=1+Math.abs(this.velocity)*2;for(let h=0;h<this.particles.length;h++){const d=this.particles[h];d.z-=d.speedZ*n,d.y-=this.velocity*3.5,d.z<=10&&(d.z=1e3,d.x=(Math.random()-.5)*i*1.5,d.y=(Math.random()-.5)*e*1.8),d.y>e&&(d.y=-e*.2),d.y<-e*.2&&(d.y=e);const p=350,u=p/(p+d.z),g=s+(d.x+this.mouseX*50)*u,m=a+(d.y+this.mouseY*50)*u,v=Math.max(.6,d.size*u*1.5),f=Math.max(.05,Math.min(.85,(1-d.z/1e3)*d.alpha));if(Math.abs(this.velocity)>.08){const b=-this.velocity*36*u;t.strokeStyle=`rgba(229, 90, 43, ${f*.9})`,t.lineWidth=v*1.2,t.beginPath(),t.moveTo(g,m),t.lineTo(g,m+b),t.stroke()}else t.fillStyle=`rgba(235, 120, 70, ${f})`,t.beginPath(),t.arc(g,m,v,0,Math.PI*2),t.fill()}}renderRibbon(){const t=this.ribbonStage.offsetWidth||window.innerWidth,i=this.ribbonStage.offsetHeight||window.innerHeight,e=t*.5,s=i*.5,a=1+Math.min(.2,Math.abs(this.velocity)*.014),r=1-Math.min(.06,Math.abs(this.velocity)*.005),l=-this.mouseY*8,c=this.mouseX*12;for(let n=0;n<this.numItems;n++){const h=this.cardElements[n];if(!h)continue;let p=((this.angle+n*this.angleStep)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;const u=Math.sin(p)*this.radiusY,g=(Math.cos(p)-1)*this.radiusZ,m=Math.sin(p*1.5)*35+this.mouseX*15,v=-p*(180/Math.PI)*.58-this.velocity*.6+l,f=Math.sin(p*1.5)*6+c,b=Math.sin(p*1.2)*3+this.velocity*.25,w=Math.max(.55,1+g/1100),S=w*r,C=w*a,x=Math.max(.12,Math.min(1,1+(g+80)/750)),E=Math.max(0,(-g-280)*.016),T=Math.round(1e3+g);h.style.transform=`
        translate3d(${e+m}px, ${s+u}px, ${g}px)
        rotateX(${v.toFixed(2)}deg)
        rotateY(${f.toFixed(2)}deg)
        rotateZ(${b.toFixed(2)}deg)
        scale(${S.toFixed(3)}, ${C.toFixed(3)})
      `,h.style.opacity=x.toFixed(3),h.style.zIndex=String(T),h.style.filter=E>.5?`blur(${E.toFixed(1)}px)`:"none",h.style.pointerEvents=g<-380?"none":"auto",Math.abs(p)<this.angleStep*.55?h.classList.add("is-active-front"):h.classList.remove("is-active-front")}}renderHUD(){const t=this.getActiveIndex();if(this.hudCounter&&(this.hudCounter.textContent=`${String(t+1).padStart(2,"0")} / ${String(this.numItems).padStart(2,"0")}`),this.hudTitleParallax){const i=this.angle*70%400;this.hudTitleParallax.style.transform=`translate3d(0, ${i.toFixed(1)}px, 0)`}if(this.progressBar){const e=(-this.angle/this.angleStep%this.numItems+this.numItems)%this.numItems/(this.numItems-1)*100;this.progressBar.style.left=`${Math.max(0,Math.min(100,e)).toFixed(1)}%`}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.cardElements=[],this.particles=[]}}class J{container;products;onSelectProduct;wrapper;textColumn;visualColumn;textPanels=[];visualPanels=[];counterCurrent;counterTotal;scrubProgress;prevBtn;nextBtn;currentPos=0;targetPos=0;velocity=0;lastPos=0;lerpFactor=.082;snapTimeoutId=0;isSnapping=!1;isDragging=!1;hasDragged=!1;startY=0;startTargetPos=0;lastDragY=0;lastDragTime=0;dragVelocity=0;isMobile=!1;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.checkMobile(),this.buildDOM(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}checkMobile(){this.isMobile=window.innerWidth<860}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="split-carousel",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Bi-Directional Editorial Split Showcase");const t=String(this.products.length).padStart(2,"0");this.wrapper.innerHTML=`
      <!-- Ambient Background Arch Layer -->
      <div class="split-carousel__ambient-bg" aria-hidden="true">
        <div class="split-carousel__bg-glow"></div>
      </div>

      <!-- Center Dividing Axis Line (Desktop) -->
      <div class="split-carousel__axis" aria-hidden="true"></div>

      <!-- Left Column: Editorial Monograph & Typographic Story -->
      <div class="split-carousel__col split-carousel__col--text" id="splitTextCol">
        <!-- Panels injected dynamically -->
      </div>

      <!-- Right Column: Monumental Floating Product Showcase -->
      <div class="split-carousel__col split-carousel__col--visual" id="splitVisualCol">
        <!-- Panels injected dynamically -->
      </div>

      <!-- Editorial HUD Navigation & Counter Dock -->
      <nav class="split-carousel__hud" aria-label="Editorial Controls">
        <div class="split-carousel__counter">
          <span class="split-carousel__counter-now" id="splitCounterNow">01</span>
          <span class="split-carousel__counter-divider">/</span>
          <span class="split-carousel__counter-total" id="splitCounterTotal">${t}</span>
        </div>

        <div class="split-carousel__scrub" id="splitScrubRail" role="slider" aria-label="Editorial Progress" aria-valuemin="1" aria-valuemax="${this.products.length}" aria-valuenow="1" tabindex="0">
          <div class="split-carousel__scrub-bar" id="splitScrubBar"></div>
        </div>

        <div class="split-carousel__nav-btns">
          <button class="split-carousel__btn split-carousel__btn--prev" id="splitPrevBtn" aria-label="Previous editorial product" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
          <button class="split-carousel__btn split-carousel__btn--next" id="splitNextBtn" aria-label="Next editorial product" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
        </div>
      </nav>
    `,this.container.appendChild(this.wrapper),this.textColumn=this.wrapper.querySelector("#splitTextCol"),this.visualColumn=this.wrapper.querySelector("#splitVisualCol"),this.counterCurrent=this.wrapper.querySelector("#splitCounterNow"),this.counterTotal=this.wrapper.querySelector("#splitCounterTotal"),this.scrubProgress=this.wrapper.querySelector("#splitScrubBar"),this.prevBtn=this.wrapper.querySelector("#splitPrevBtn"),this.nextBtn=this.wrapper.querySelector("#splitNextBtn"),this.products.forEach((i,e)=>{const s=String(e+1).padStart(2,"0"),a=i.category.toUpperCase(),r=document.createElement("article");r.className="split-text-panel",r.dataset.index=String(e);const l=i.ingredients.slice(0,4).map(h=>`<span class="split-text-panel__pill">${h}</span>`).join("");r.innerHTML=`
        <div class="split-text-panel__inner">
          <div class="split-text-panel__meta-row">
            <span class="split-text-panel__tag">${a} • ARCHIVE</span>
            <span class="split-text-panel__weight">${i.weight}</span>
          </div>

          <div class="split-text-panel__mask">
            <span class="split-text-panel__origin">${i.origin}</span>
          </div>

          <div class="split-text-panel__mask split-text-panel__mask--title">
            <h2 class="split-text-panel__title">${i.title}</h2>
          </div>

          <div class="split-text-panel__mask">
            <p class="split-text-panel__latin">${i.latinSubtitle}</p>
          </div>

          <div class="split-text-panel__mask split-text-panel__mask--desc">
            <p class="split-text-panel__desc">${i.description}</p>
          </div>

          <div class="split-text-panel__ingredients">
            <span class="split-text-panel__ing-title">TERROIR BOTANICALS:</span>
            <div class="split-text-panel__pills">
              ${l}
            </div>
          </div>

          <div class="split-text-panel__footer">
            <span class="split-text-panel__price">${i.price}</span>
            <button class="split-text-panel__cta" type="button" data-slug="${i.slug}">
              <span>DISCOVER HARVEST</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </button>
          </div>
        </div>
      `;const c=r.querySelector(".split-text-panel__cta");c&&c.addEventListener("click",()=>{this.onSelectProduct&&this.onSelectProduct(i)}),this.textColumn.appendChild(r),this.textPanels.push(r);const n=document.createElement("div");n.className="split-visual-panel",n.dataset.index=String(e),n.innerHTML=`
        <div class="split-visual-panel__inner">
          <!-- Ambient Circular Terroir Plate -->
          <div class="split-visual-panel__halo"></div>

          <!-- Monumental Jar with Parallax Depth -->
          <div class="split-visual-panel__stage">
            <img 
              class="split-visual-panel__img" 
              src="${i.jarUrl}" 
              alt="${i.title}" 
              loading="${e<3?"eager":"lazy"}" 
              decoding="async" 
              draggable="false"
            />
          </div>

          <!-- Bottom Roman Plate Tag -->
          <div class="split-visual-panel__watermark">
            <span>NO. ${s}</span>
            <span>SICILIA</span>
          </div>
        </div>
      `,n.addEventListener("click",()=>{if(this.hasDragged)return;const h=Math.round(this.currentPos);e===h?this.onSelectProduct&&this.onSelectProduct(i):this.snapToIndex(e)}),this.visualColumn.appendChild(n),this.visualPanels.push(n)})}bindEvents(){const t=(n,h,d,p)=>{n.addEventListener(h,d,p),this.boundEvents.push({target:n,type:h,handler:d,options:p})},i=n=>{if(!n.target.closest("button, .split-carousel__scrub")){this.isDragging=!0,this.hasDragged=!1,this.startY=n.clientY,this.lastDragY=n.clientY,this.lastDragTime=performance.now(),this.startTargetPos=this.targetPos,this.dragVelocity=0;try{n.target.setPointerCapture(n.pointerId)}catch{}}},e=n=>{if(!this.isDragging)return;const h=n.clientY-this.startY;!this.hasDragged&&Math.abs(h)>6&&(this.hasDragged=!0);const d=window.innerHeight||800,p=-(h/(d*.75));this.targetPos=Math.max(-.25,Math.min(this.products.length-.75,this.startTargetPos+p));const u=performance.now(),g=Math.max(1,u-this.lastDragTime),m=n.clientY-this.lastDragY;this.dragVelocity=m/g*16.67,this.lastDragY=n.clientY,this.lastDragTime=u},s=n=>{if(this.isDragging){this.isDragging=!1;try{n.target.releasePointerCapture(n.pointerId)}catch{}if(Math.abs(this.dragVelocity)>4){const h=-(this.dragVelocity/60);this.targetPos+=h}this.snapToNearest()}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=n=>{n.preventDefault();const h=n.deltaY,d=.0018;this.targetPos=Math.max(0,Math.min(this.products.length-1,this.targetPos+h*d)),window.clearTimeout(this.snapTimeoutId),this.isSnapping=!1,this.snapTimeoutId=window.setTimeout(()=>{this.snapToNearest()},120)};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",n=>{n.key==="ArrowDown"||n.key==="ArrowRight"?(n.preventDefault(),this.stepBy(1)):(n.key==="ArrowUp"||n.key==="ArrowLeft")&&(n.preventDefault(),this.stepBy(-1))}),this.prevBtn&&t(this.prevBtn,"click",()=>this.stepBy(-1)),this.nextBtn&&t(this.nextBtn,"click",()=>this.stepBy(1));const l=this.wrapper.querySelector("#splitScrubRail");l&&t(l,"pointerdown",n=>{const h=n,d=l.getBoundingClientRect(),p=Math.max(0,Math.min(1,(h.clientY-d.top)/d.height)),u=Math.round(p*(this.products.length-1));this.snapToIndex(u)}),t(window,"resize",()=>{this.checkMobile()})}stepBy(t){const i=Math.round(this.currentPos),e=Math.max(0,Math.min(this.products.length-1,i+t));this.snapToIndex(e)}snapToIndex(t){this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}snapToNearest(){const t=Math.round(this.targetPos);this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}loop(){this.isRunning&&(this.currentPos+=(this.targetPos-this.currentPos)*this.lerpFactor,this.velocity=(this.currentPos-this.lastPos)*60,this.lastPos=this.currentPos,this.renderColumns(),this.renderHUD(),this.animationFrameId=requestAnimationFrame(this.loop))}renderColumns(){const t=this.products.length;for(let i=0;i<t;i++){const e=this.textPanels[i],s=this.visualPanels[i];if(!e||!s)continue;const a=i-this.currentPos,r=a*100,l=Math.max(.78,1-Math.abs(a)*.18),c=Math.max(0,Math.min(1,1-Math.abs(a)*.85)),n=-a*45;s.style.transform=`translate3d(0, ${r.toFixed(2)}%, 0)`,s.style.opacity=c.toFixed(3),s.style.pointerEvents=Math.abs(a)<.4?"auto":"none";const h=s.querySelector(".split-visual-panel__img");h&&(h.style.transform=`translate3d(0, ${n.toFixed(1)}px, 0) scale(${l.toFixed(3)})`);const d=this.isMobile?a*100:-a*100,p=Math.max(0,Math.min(1,1-Math.abs(a)*.95));e.style.transform=`translate3d(0, ${d.toFixed(2)}%, 0)`,e.style.opacity=p.toFixed(3),e.style.pointerEvents=Math.abs(a)<.4?"auto":"none";const u=e.querySelector(".split-text-panel__title"),g=e.querySelector(".split-text-panel__desc"),m=e.querySelector(".split-text-panel__footer");if(u&&g&&m){const v=this.isMobile?a*25:-a*35,f=this.isMobile?a*18:-a*22;u.style.transform=`translate3d(0, ${v.toFixed(1)}px, 0)`,g.style.transform=`translate3d(0, ${f.toFixed(1)}px, 0)`}Math.abs(a)<.35?(e.classList.add("is-active-editorial"),s.classList.add("is-active-editorial")):(e.classList.remove("is-active-editorial"),s.classList.remove("is-active-editorial"))}}renderHUD(){const t=Math.max(0,Math.min(this.products.length-1,Math.round(this.currentPos)));if(this.counterCurrent&&(this.counterCurrent.textContent=String(t+1).padStart(2,"0")),this.scrubProgress){const i=this.currentPos/(this.products.length-1),e=Math.max(0,Math.min(100,i*100));this.scrubProgress.style.height=`${e.toFixed(1)}%`}this.prevBtn&&(this.prevBtn.style.opacity=t===0?"0.35":"1",this.prevBtn.style.pointerEvents=t===0?"none":"auto"),this.nextBtn&&(this.nextBtn.style.opacity=t===this.products.length-1?"0.35":"1",this.nextBtn.style.pointerEvents=t===this.products.length-1?"none":"auto")}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),window.clearTimeout(this.snapTimeoutId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.textPanels=[],this.visualPanels=[]}}class K{container;products;onSelectProduct;wrapper;astrolabeSvg;orbitTrack;cardElements=[];zenithInfoBox;azimuthText;counterText;scrubProgress;prevBtn;nextBtn;angle=0;targetAngle=0;velocity=0;lastAngle=0;numItems;angleStep=.38;lerpFactor=.075;snapTimeoutId=0;pivotX=0;pivotY=0;radiusX=820;radiusY=700;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetAngle=0;lastClientX=0;lastDragTime=0;dragVelocity=0;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.numItems=this.products.length,this.buildDOM(),this.updateDimensions(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="orbital-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Off-Screen Orbital Sundial Arc Showcase");const t=String(this.numItems).padStart(2,"0");this.wrapper.innerHTML=`
      <!-- Ambient Terroir Sky Glow -->
      <div class="orbital-sky-glow" aria-hidden="true"></div>

      <!-- Rotating Astrolabe / Celestial Sundial Wheel (SVG) -->
      <div class="orbital-dial-wrapper" id="orbitalDialWrap" aria-hidden="true">
        <svg class="orbital-astrolabe" id="orbitalAstrolabe" viewBox="-1200 -1200 2400 2400" width="2400" height="2400">
          <defs>
            <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#E94E1B" stop-opacity="0.08"/>
              <stop offset="70%" stop-color="#762530" stop-opacity="0.04"/>
              <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Dial Plate Background Glow -->
          <circle cx="0" cy="0" r="1150" fill="url(#dialGlow)" />

          <!-- Outer Roman Solstice & Degree Rings -->
          <circle cx="0" cy="0" r="1120" stroke="rgba(118, 37, 48, 0.16)" stroke-width="1.5" fill="none" stroke-dasharray="4 8"/>
          <circle cx="0" cy="0" r="1080" stroke="rgba(229, 90, 43, 0.35)" stroke-width="1.5" fill="none"/>
          <circle cx="0" cy="0" r="1040" stroke="rgba(118, 37, 48, 0.12)" stroke-width="1" fill="none"/>
          <circle cx="0" cy="0" r="920"  stroke="rgba(118, 37, 48, 0.15)" stroke-width="1.5" fill="none"/>
          <circle cx="0" cy="0" r="800"  stroke="rgba(229, 90, 43, 0.25)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
          <circle cx="0" cy="0" r="620"  stroke="rgba(118, 37, 48, 0.12)" stroke-width="1" fill="none"/>

          <!-- 72 Precision Astrolabe Rays -->
          <g class="orbital-astrolabe__rays" opacity="0.4">
            ${Array.from({length:72}).map((e,s)=>{const a=s*5,r=a%30===0,l=r?920:1040,c=1080,n=a*Math.PI/180,h=Math.cos(n)*l,d=Math.sin(n)*l,p=Math.cos(n)*c,u=Math.sin(n)*c;return`<line x1="${h.toFixed(1)}" y1="${d.toFixed(1)}" x2="${p.toFixed(1)}" y2="${u.toFixed(1)}" stroke="${r?"#E94E1B":"rgba(118, 37, 48, 0.3)"}" stroke-width="${r?"2":"1"}"/>`}).join("")}
          </g>

          <!-- Roman Astrolabe Degree Numerals -->
          <g class="orbital-astrolabe__texts" fill="rgba(118, 37, 48, 0.55)" font-family="Cinzel, Georgia, serif" font-size="16" letter-spacing="0.15em">
            ${["0° • ARIES","30° • ETNA MIDDAY","60° • SOLLEONE","90° • EAST HORIZON","120° • AUTUNNO","150° • RACCOLTO","180° • NADIR","210° • VENDEMMIA","240° • TRAMONTO","270° • WEST HORIZON","300° • EQUINOZIO","330° • MEDITERRANEO"].map((e,s)=>{const a=s*30-90,r=a*Math.PI/180,l=Math.cos(r)*980,c=Math.sin(r)*980;return`<text x="${l.toFixed(1)}" y="${c.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${a+90}, ${l.toFixed(1)}, ${c.toFixed(1)})">${e}</text>`}).join("")}
          </g>
        </svg>
      </div>

      <!-- Celestial Top Telemetry Header -->
      <header class="orbital-hud-top" aria-hidden="true">
        <div class="orbital-hud-cell">
          <span class="orbital-hud-dot"></span>
          <span class="orbital-hud-label">EXP // 05</span>
          <span class="orbital-hud-val">CELESTIAL SUNDIAL ARC</span>
        </div>
        <div class="orbital-hud-cell orbital-hud-cell--coords">
          <span class="orbital-hud-label">AZIMUTH</span>
          <span class="orbital-hud-val" id="orbitalAzimuthText">180° 00' 00" // ZENITH HARVEST</span>
        </div>
        <div class="orbital-hud-cell">
          <span class="orbital-hud-label">PLANET</span>
          <span class="orbital-hud-val" id="orbitalCounter">01 / ${t}</span>
        </div>
      </header>

      <!-- Center Solar Zenith Halo Light -->
      <div class="orbital-zenith-halo" aria-hidden="true"></div>

      <!-- 3D Orbit Stage for Floating Jars -->
      <div class="orbital-stage" id="orbitalStage">
        <div class="orbital-track" id="orbitalTrack">
          <!-- Cards injected dynamically -->
        </div>
      </div>

      <!-- Active Zenith Product Monograph Info Box -->
      <div class="orbital-zenith-info" id="orbitalZenithInfo">
        <div class="orbital-zenith-info__tag" id="orbitalZenithCategory">CONFETTURA EXTRA</div>
        <h2 class="orbital-zenith-info__title" id="orbitalZenithTitle">Sicilian Pistachio Pesto</h2>
        <p class="orbital-zenith-info__sub" id="orbitalZenithSub">Pistacia Vera Siculus</p>
        <div class="orbital-zenith-info__meta">
          <span class="orbital-zenith-info__price" id="orbitalZenithPrice">€8.50</span>
          <span class="orbital-zenith-info__weight" id="orbitalZenithWeight">210g ℮</span>
          <button class="orbital-zenith-info__cta" id="orbitalZenithCta" type="button">
            <span>DISCOVER HARVEST</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </button>
        </div>
      </div>

      <!-- Bottom Celestial Timepiece Controls -->
      <footer class="orbital-hud-bottom">
        <div class="orbital-controls">
          <button class="orbital-btn orbital-btn--prev" id="orbitalPrevBtn" aria-label="Previous celestial product" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>PREV</span>
          </button>

          <div class="orbital-scrub-rail" id="orbitalScrubRail" role="slider" aria-label="Astronomical Orbit Scrubber" aria-valuemin="1" aria-valuemax="${this.numItems}" aria-valuenow="1" tabindex="0">
            <div class="orbital-scrub-track"></div>
            <div class="orbital-scrub-thumb" id="orbitalProgressBar"></div>
          </div>

          <button class="orbital-btn orbital-btn--next" id="orbitalNextBtn" aria-label="Next celestial product" type="button">
            <span>NEXT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div class="orbital-hint" aria-hidden="true">
          <span>DRAG // WHEEL // ARROWS TO ROTATE SUNDIAL</span>
        </div>
      </footer>
    `,this.container.appendChild(this.wrapper),this.astrolabeSvg=this.wrapper.querySelector("#orbitalAstrolabe"),this.orbitTrack=this.wrapper.querySelector("#orbitalTrack"),this.zenithInfoBox=this.wrapper.querySelector("#orbitalZenithInfo"),this.azimuthText=this.wrapper.querySelector("#orbitalAzimuthText"),this.counterText=this.wrapper.querySelector("#orbitalCounter"),this.scrubProgress=this.wrapper.querySelector("#orbitalProgressBar"),this.prevBtn=this.wrapper.querySelector("#orbitalPrevBtn"),this.nextBtn=this.wrapper.querySelector("#orbitalNextBtn"),this.products.forEach((e,s)=>{const a=document.createElement("div");a.className="orbital-card",a.dataset.index=String(s),a.dataset.slug=e.slug;const r=String(s+1).padStart(2,"0");a.innerHTML=`
        <div class="orbital-card__inner">
          <!-- Orbital Celestial Reticle Ring -->
          <div class="orbital-card__orbit-ring" aria-hidden="true"></div>

          <!-- Celestial Node Marker -->
          <div class="orbital-card__node-num">${r}</div>

          <!-- Glass Jar Cutout -->
          <div class="orbital-card__jar-stage">
            <img 
              class="orbital-card__jar-img" 
              src="${e.jarUrl}" 
              alt="${e.title}" 
              loading="${s<4?"eager":"lazy"}" 
              decoding="async" 
              draggable="false"
            />
          </div>

          <!-- Subtle Hover Title -->
          <div class="orbital-card__name-plate">
            <span>${e.title}</span>
          </div>
        </div>
      `,a.addEventListener("click",l=>{if(this.hasDragged){l.preventDefault();return}const c=this.getActiveIndex();s===c?this.onSelectProduct&&this.onSelectProduct(e):this.snapToIndex(s)}),this.orbitTrack.appendChild(a),this.cardElements.push(a)});const i=this.wrapper.querySelector("#orbitalZenithCta");i&&i.addEventListener("click",()=>{const e=this.getActiveIndex(),s=this.products[e];s&&this.onSelectProduct&&this.onSelectProduct(s)})}updateDimensions(){const t=window.innerWidth,i=window.innerHeight;this.pivotX=t*.5,t<600?(this.radiusX=t*.72,this.radiusY=i*.52,this.pivotY=i+this.radiusY*.38,this.angleStep=.52):t<1024?(this.radiusX=t*.58,this.radiusY=i*.62,this.pivotY=i+this.radiusY*.48,this.angleStep=.42):(this.radiusX=Math.min(880,t*.52),this.radiusY=Math.min(760,i*.68),this.pivotY=i+this.radiusY*.52,this.angleStep=.36);const e=this.wrapper.querySelector("#orbitalDialWrap");e&&(e.style.left=`${this.pivotX}px`,e.style.top=`${this.pivotY}px`)}bindEvents(){const t=(n,h,d,p)=>{n.addEventListener(h,d,p),this.boundEvents.push({target:n,type:h,handler:d,options:p})},i=n=>{if(!n.target.closest("button, .orbital-scrub-rail, .orbital-zenith-info")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=n.clientX,this.startClientY=n.clientY,this.lastClientX=n.clientX,this.lastDragTime=performance.now(),this.startTargetAngle=this.targetAngle,this.dragVelocity=0;try{n.target.setPointerCapture(n.pointerId)}catch{}}},e=n=>{if(!this.isDragging)return;const h=n.clientX-this.startClientX,d=n.clientY-this.startClientY;!this.hasDragged&&(Math.abs(h)>6||Math.abs(d)>6)&&(this.hasDragged=!0);const p=h/(this.radiusX*1.1);this.targetAngle=this.startTargetAngle+p;const u=performance.now(),g=Math.max(1,u-this.lastDragTime),m=n.clientX-this.lastClientX;this.dragVelocity=m/g*16.67,this.lastClientX=n.clientX,this.lastDragTime=u},s=n=>{if(this.isDragging){this.isDragging=!1;try{n.target.releasePointerCapture(n.pointerId)}catch{}if(Math.abs(this.dragVelocity)>3){const h=this.dragVelocity/this.radiusX*.95;this.targetAngle+=h}this.snapToNearest()}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=n=>{n.preventDefault();const h=Math.abs(n.deltaX)>Math.abs(n.deltaY)?n.deltaX:n.deltaY,d=.0016;this.targetAngle-=h*d,window.clearTimeout(this.snapTimeoutId),this.snapTimeoutId=window.setTimeout(()=>{this.snapToNearest()},140)};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",n=>{n.key==="ArrowRight"||n.key==="ArrowDown"?(n.preventDefault(),this.stepBy(1)):(n.key==="ArrowLeft"||n.key==="ArrowUp")&&(n.preventDefault(),this.stepBy(-1))}),this.prevBtn&&t(this.prevBtn,"click",()=>this.stepBy(-1)),this.nextBtn&&t(this.nextBtn,"click",()=>this.stepBy(1));const l=this.wrapper.querySelector("#orbitalScrubRail");l&&t(l,"pointerdown",n=>{const h=n,d=l.getBoundingClientRect(),p=Math.max(0,Math.min(1,(h.clientX-d.left)/d.width)),u=Math.round(p*(this.numItems-1));this.snapToIndex(u)}),t(window,"resize",()=>{this.updateDimensions()})}stepBy(t){const e=(this.getActiveIndex()+t+this.numItems)%this.numItems;this.snapToIndex(e)}snapToIndex(t){const i=-t*this.angleStep,e=Math.round(this.targetAngle/(Math.PI*2));let s=i+e*(Math.PI*2);const a=s-this.targetAngle;a>Math.PI&&(s-=Math.PI*2),a<-Math.PI&&(s+=Math.PI*2),this.targetAngle=s}snapToNearest(){const t=this.getActiveIndex();this.snapToIndex(t)}getActiveIndex(){const i=(-this.angle/this.angleStep%this.numItems+this.numItems)%this.numItems;return Math.round(i)%this.numItems}loop(){if(this.isRunning){if(this.angle+=(this.targetAngle-this.angle)*this.lerpFactor,this.velocity=(this.angle-this.lastAngle)*60,this.lastAngle=this.angle,this.astrolabeSvg){const t=this.angle*180/Math.PI;this.astrolabeSvg.style.transform=`rotate(${t.toFixed(2)}deg)`}this.renderOrbit(),this.renderHUD(),this.animationFrameId=requestAnimationFrame(this.loop)}}renderOrbit(){for(let t=0;t<this.numItems;t++){const i=this.cardElements[t];if(!i)continue;let s=((this.angle+t*this.angleStep)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;const a=this.pivotX+Math.sin(s)*this.radiusX,r=this.pivotY-Math.cos(s)*this.radiusY,l=s*(180/Math.PI)*.78,c=Math.abs(s),n=Math.max(.55,1-c*.32),h=Math.max(0,Math.min(1,1-(c-.28)*1.5)),d=Math.max(0,(c-.4)*12),p=Math.round(1e3-c*500);i.style.transform=`
        translate3d(${a.toFixed(1)}px, ${r.toFixed(1)}px, 0)
        translate(-50%, -50%)
        rotate(${l.toFixed(2)}deg)
        scale(${n.toFixed(3)})
      `,i.style.opacity=h.toFixed(3),i.style.zIndex=String(p),i.style.filter=d>.8?`blur(${d.toFixed(1)}px)`:"none",i.style.pointerEvents=c<.38?"auto":"none",c<.16?i.classList.add("is-zenith"):i.classList.remove("is-zenith")}}renderHUD(){const t=this.getActiveIndex(),i=this.products[t];if(this.counterText&&(this.counterText.textContent=`${String(t+1).padStart(2,"0")} / ${String(this.numItems).padStart(2,"0")}`),this.azimuthText){const e=-this.angle*180/Math.PI%360,s=Math.round((e+360)%360);this.azimuthText.textContent=`AZIMUTH ${String(s).padStart(3,"0")}° 00' // HARVEST ZENITH`}if(this.scrubProgress){const s=(-this.angle/this.angleStep%this.numItems+this.numItems)%this.numItems/(this.numItems-1)*100;this.scrubProgress.style.left=`${Math.max(0,Math.min(100,s)).toFixed(1)}%`}if(i&&this.zenithInfoBox){const e=this.zenithInfoBox.querySelector("#orbitalZenithCategory"),s=this.zenithInfoBox.querySelector("#orbitalZenithTitle"),a=this.zenithInfoBox.querySelector("#orbitalZenithSub"),r=this.zenithInfoBox.querySelector("#orbitalZenithPrice"),l=this.zenithInfoBox.querySelector("#orbitalZenithWeight");e&&e.textContent!==i.category.toUpperCase()&&(e.textContent=`${i.category.toUpperCase()} • ZENITH RESERVE`),s&&s.textContent!==i.title&&(s.textContent=i.title),a&&a.textContent!==i.latinSubtitle&&(a.textContent=i.latinSubtitle),r&&r.textContent!==i.price&&(r.textContent=i.price),l&&l.textContent!==i.weight&&(l.textContent=i.weight)}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),window.clearTimeout(this.snapTimeoutId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.cardElements=[]}}class tt{container;products;onSelectProduct;wrapper;grainCanvas;grainCtx=null;filmStrip;filmFrames=[];tcDisplay;reelDisplay;creditsContainer;progressBar;prevBtn;nextBtn;currentPos=0;targetPos=0;velocity=0;lastPos=0;lerpFactor=.078;dollyScale=1;snapTimeoutId=0;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetPos=0;lastClientX=0;lastDragTime=0;dragVelocity=0;lastGrainTime=0;grainInterval=1e3/24;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.buildDOM(),this.initGrainCanvas(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="a24-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","A24 35mm Cinema Film Strip Showcase");const t=String(this.products.length).padStart(2,"0");this.wrapper.innerHTML=`
      <!-- Procedural 24fps Celluloid Film Grain Canvas -->
      <canvas class="a24-grain-canvas" id="a24Grain" aria-hidden="true"></canvas>

      <!-- Anamorphic Letterbox Bars (Top & Bottom Cinema Mattes) -->
      <div class="a24-letterbox a24-letterbox--top" aria-hidden="true"></div>
      <div class="a24-letterbox a24-letterbox--bottom" aria-hidden="true"></div>

      <!-- Top Cinematic Camera Header & Timecode Readout -->
      <header class="a24-hud-top" aria-hidden="true">
        <div class="a24-hud-cell">
          <span class="a24-rec-dot"></span>
          <span class="a24-hud-label">EXP // 06</span>
          <span class="a24-hud-val">A24 CINEMA 35MM</span>
        </div>
        <div class="a24-hud-cell a24-hud-cell--cam">
          <span class="a24-hud-label">CAM</span>
          <span class="a24-hud-val">ARRI ALEXA LF • ANAMORPHIC 2.39:1 • 24.00 FPS</span>
        </div>
        <div class="a24-hud-cell a24-hud-cell--tc">
          <span class="a24-hud-label">TC</span>
          <span class="a24-hud-val" id="a24Timecode">00:01:24:18</span>
        </div>
        <div class="a24-hud-cell">
          <span class="a24-hud-label">REEL</span>
          <span class="a24-hud-val" id="a24ReelCount">01 / ${t}</span>
        </div>
      </header>

      <!-- Center Film Strip Viewport -->
      <div class="a24-viewport" id="a24Viewport">
        <div class="a24-film-track" id="a24Track">
          <!-- Film frames injected dynamically -->
        </div>
      </div>

      <!-- Cinematic Lower-Thirds Opening Credits Block -->
      <div class="a24-credits" id="a24Credits">
        <div class="a24-credits__inner">
          <div class="a24-credits__row">
            <span class="a24-credits__key">PRODUCTION</span>
            <span class="a24-credits__val" id="a24CreditCategory">CONFETTURA EXTRA BIOLOGICA</span>
          </div>
          <div class="a24-credits__title-row">
            <h2 class="a24-credits__title" id="a24CreditTitle">Sicilian Pistachio Pesto</h2>
            <span class="a24-credits__latin" id="a24CreditLatin">Pistacia Vera Siculus</span>
          </div>
          <div class="a24-credits__row">
            <span class="a24-credits__key">TERROIR</span>
            <span class="a24-credits__val" id="a24CreditOrigin">MOUNT ETNA VALLEY, SICILY</span>
          </div>
          <div class="a24-credits__row">
            <span class="a24-credits__key">STARRING</span>
            <span class="a24-credits__val" id="a24CreditIngredients">SICILIAN PISTACHIO (65%), EXTRA VIRGIN OLIVE OIL</span>
          </div>
          <div class="a24-credits__action-row">
            <span class="a24-credits__price" id="a24CreditPrice">€8.50</span>
            <span class="a24-credits__weight" id="a24CreditWeight">210G ℮</span>
            <button class="a24-credits__btn" id="a24ScreenBtn" type="button">
              <span>VIEW SCREENING</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Film Reel Timeline & Scrubber -->
      <footer class="a24-hud-bottom">
        <div class="a24-controls">
          <button class="a24-btn a24-btn--prev" id="a24PrevBtn" aria-label="Previous reel" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 20L9 12l10-8v16zM5 19V5"/></svg>
            <span>PREV REEL</span>
          </button>

          <div class="a24-scrub-rail" id="a24ScrubRail" role="slider" aria-label="35mm Film Timeline" aria-valuemin="1" aria-valuemax="${this.products.length}" aria-valuenow="1" tabindex="0">
            <div class="a24-scrub-sprockets" aria-hidden="true"></div>
            <div class="a24-scrub-bar" id="a24ProgressBar"></div>
          </div>

          <button class="a24-btn a24-btn--next" id="a24NextBtn" aria-label="Next reel" type="button">
            <span>NEXT REEL</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 4l10 8-10 8V4zM19 5v14"/></svg>
          </button>
        </div>

        <div class="a24-hud-hint" aria-hidden="true">
          <span>DRAG TIMELINE // SCROLL TO DOLLY REEL</span>
        </div>
      </footer>
    `,this.container.appendChild(this.wrapper),this.grainCanvas=this.wrapper.querySelector("#a24Grain"),this.filmStrip=this.wrapper.querySelector("#a24Track"),this.tcDisplay=this.wrapper.querySelector("#a24Timecode"),this.reelDisplay=this.wrapper.querySelector("#a24ReelCount"),this.creditsContainer=this.wrapper.querySelector("#a24Credits"),this.progressBar=this.wrapper.querySelector("#a24ProgressBar"),this.prevBtn=this.wrapper.querySelector("#a24PrevBtn"),this.nextBtn=this.wrapper.querySelector("#a24NextBtn"),this.products.forEach((e,s)=>{const a=document.createElement("article");a.className="a24-frame",a.dataset.index=String(s),a.dataset.slug=e.slug;const r=String(s+1).padStart(2,"0");a.innerHTML=`
        <div class="a24-frame__cell">
          <!-- 35mm Sprocket Holes Header -->
          <div class="a24-frame__sprocket-strip a24-frame__sprocket-strip--top" aria-hidden="true">
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
          </div>

          <!-- Cinema Frame Film Edge Marks -->
          <div class="a24-frame__edge-marks" aria-hidden="true">
            <span class="a24-edge-kodak">▲ KODAK 5219</span>
            <span class="a24-edge-frame">FRAME ${r}</span>
            <span class="a24-edge-safety">SAFETY FILM</span>
          </div>

          <!-- Anamorphic Jar Stage with Atmospheric Light -->
          <div class="a24-frame__stage">
            <div class="a24-frame__projector-beam" aria-hidden="true"></div>
            <img 
              class="a24-frame__jar-img" 
              src="${e.jarUrl}" 
              alt="${e.title}" 
              loading="${s<3?"eager":"lazy"}" 
              decoding="async" 
              draggable="false"
            />
          </div>

          <!-- 35mm Sprocket Holes Footer -->
          <div class="a24-frame__sprocket-strip a24-frame__sprocket-strip--bottom" aria-hidden="true">
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
          </div>
        </div>
      `,a.addEventListener("click",l=>{if(this.hasDragged){l.preventDefault();return}const c=Math.round(this.currentPos);s===c?this.onSelectProduct&&this.onSelectProduct(e):this.snapToIndex(s)}),this.filmStrip.appendChild(a),this.filmFrames.push(a)});const i=this.wrapper.querySelector("#a24ScreenBtn");i&&i.addEventListener("click",()=>{const e=Math.max(0,Math.min(this.products.length-1,Math.round(this.currentPos))),s=this.products[e];s&&this.onSelectProduct&&this.onSelectProduct(s)})}initGrainCanvas(){this.grainCtx=this.grainCanvas.getContext("2d",{alpha:!0}),this.resizeGrain()}resizeGrain(){if(!this.grainCanvas)return;const t=window.innerWidth,i=window.innerHeight;this.grainCanvas.width=Math.min(t,512),this.grainCanvas.height=Math.min(i,512)}renderGrain(){if(!this.grainCtx||!this.grainCanvas)return;const t=this.grainCtx,i=this.grainCanvas.width,e=this.grainCanvas.height,s=t.createImageData(i,e),a=new Uint32Array(s.data.buffer),r=a.length;for(let l=0;l<r;l++)if(Math.random()<.08){const c=Math.floor(Math.random()*22+8);a[l]=c<<24|35<<16|11520|70}t.putImageData(s,0,0)}bindEvents(){const t=(n,h,d,p)=>{n.addEventListener(h,d,p),this.boundEvents.push({target:n,type:h,handler:d,options:p})},i=n=>{if(!n.target.closest("button, .a24-scrub-rail, .a24-credits")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=n.clientX,this.startClientY=n.clientY,this.lastClientX=n.clientX,this.lastDragTime=performance.now(),this.startTargetPos=this.targetPos,this.dragVelocity=0;try{n.target.setPointerCapture(n.pointerId)}catch{}}},e=n=>{if(!this.isDragging)return;const h=n.clientX-this.startClientX,d=n.clientY-this.startClientY;!this.hasDragged&&(Math.abs(h)>6||Math.abs(d)>6)&&(this.hasDragged=!0);const p=window.innerWidth||1200,u=-(h/(p*.55));this.targetPos=Math.max(-.2,Math.min(this.products.length-.8,this.startTargetPos+u));const g=performance.now(),m=Math.max(1,g-this.lastDragTime),v=n.clientX-this.lastClientX;this.dragVelocity=v/m*16.67,this.lastClientX=n.clientX,this.lastDragTime=g},s=n=>{if(this.isDragging){this.isDragging=!1;try{n.target.releasePointerCapture(n.pointerId)}catch{}if(Math.abs(this.dragVelocity)>3){const h=-(this.dragVelocity/50);this.targetPos+=h}this.snapToNearest()}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=n=>{n.preventDefault();const h=Math.abs(n.deltaX)>Math.abs(n.deltaY)?n.deltaX:n.deltaY,d=.0016;this.targetPos=Math.max(0,Math.min(this.products.length-1,this.targetPos+h*d)),window.clearTimeout(this.snapTimeoutId),this.snapTimeoutId=window.setTimeout(()=>{this.snapToNearest()},130)};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",n=>{n.key==="ArrowRight"||n.key==="ArrowDown"?(n.preventDefault(),this.stepBy(1)):(n.key==="ArrowLeft"||n.key==="ArrowUp")&&(n.preventDefault(),this.stepBy(-1))}),this.prevBtn&&t(this.prevBtn,"click",()=>this.stepBy(-1)),this.nextBtn&&t(this.nextBtn,"click",()=>this.stepBy(1));const l=this.wrapper.querySelector("#a24ScrubRail");l&&t(l,"pointerdown",n=>{const h=n,d=l.getBoundingClientRect(),p=Math.max(0,Math.min(1,(h.clientX-d.left)/d.width)),u=Math.round(p*(this.products.length-1));this.snapToIndex(u)}),t(window,"resize",()=>{this.resizeGrain()})}stepBy(t){const i=Math.round(this.currentPos),e=Math.max(0,Math.min(this.products.length-1,i+t));this.snapToIndex(e)}snapToIndex(t){this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}snapToNearest(){const t=Math.round(this.targetPos);this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}loop(t){if(!this.isRunning)return;this.currentPos+=(this.targetPos-this.currentPos)*this.lerpFactor,this.velocity=(this.currentPos-this.lastPos)*60,this.lastPos=this.currentPos;const i=1-Math.min(.08,Math.abs(this.velocity)*.024);this.dollyScale+=(i-this.dollyScale)*.12,t-this.lastGrainTime>this.grainInterval&&(this.renderGrain(),this.lastGrainTime=t),this.renderFilmStrip(),this.renderHUD(t),this.animationFrameId=requestAnimationFrame(this.loop)}renderFilmStrip(){const t=this.products.length,i=window.innerWidth,e=Math.min(540,i*.58),s=Math.max(-3.5,Math.min(3.5,-this.velocity*1.8));for(let a=0;a<t;a++){const r=this.filmFrames[a];if(!r)continue;const l=a-this.currentPos,c=l*e,n=Math.max(.72,1-Math.abs(l)*.22)*this.dollyScale,h=Math.max(.12,Math.min(1,1-Math.abs(l)*.65)),d=Math.round(1e3-Math.abs(l)*500);r.style.transform=`
        translate3d(calc(-50% + ${c.toFixed(1)}px), -50%, 0)
        rotateZ(${s.toFixed(2)}deg)
        scale(${n.toFixed(3)})
      `,r.style.opacity=h.toFixed(3),r.style.zIndex=String(d),r.style.pointerEvents=Math.abs(l)<.45?"auto":"none";const p=r.querySelector(".a24-frame__jar-img");if(p){const u=-l*35;p.style.transform=`translate3d(${u.toFixed(1)}px, 0, 0)`}Math.abs(l)<.35?r.classList.add("is-active-reel"):r.classList.remove("is-active-reel")}}renderHUD(t){const i=Math.max(0,Math.min(this.products.length-1,Math.round(this.currentPos))),e=this.products[i];if(this.reelDisplay&&(this.reelDisplay.textContent=`${String(i+1).padStart(2,"0")} / ${String(this.products.length).padStart(2,"0")}`),this.tcDisplay){const s=Math.floor(t/1e3),a=Math.floor(t%1e3/(1e3/24)),r=String(s%60).padStart(2,"0"),l=String(Math.floor(s/60)%60).padStart(2,"0"),c=String(a).padStart(2,"0");this.tcDisplay.textContent=`00:${l}:${r}:${c}`}if(this.progressBar){const s=this.currentPos/(this.products.length-1),a=Math.max(0,Math.min(100,s*100));this.progressBar.style.left=`${a.toFixed(1)}%`}if(e&&this.creditsContainer){const s=this.creditsContainer.querySelector("#a24CreditCategory"),a=this.creditsContainer.querySelector("#a24CreditTitle"),r=this.creditsContainer.querySelector("#a24CreditLatin"),l=this.creditsContainer.querySelector("#a24CreditOrigin"),c=this.creditsContainer.querySelector("#a24CreditIngredients"),n=this.creditsContainer.querySelector("#a24CreditPrice"),h=this.creditsContainer.querySelector("#a24CreditWeight");if(s&&s.textContent!==e.category.toUpperCase()&&(s.textContent=`${e.category.toUpperCase()} • 35MM SELECTION`),a&&a.textContent!==e.title&&(a.textContent=e.title),r&&r.textContent!==e.latinSubtitle&&(r.textContent=e.latinSubtitle),l&&l.textContent!==e.origin.toUpperCase()&&(l.textContent=e.origin.toUpperCase()),c){const d=e.ingredients.slice(0,3).join(", ").toUpperCase();c.textContent!==d&&(c.textContent=d)}n&&n.textContent!==e.price&&(n.textContent=e.price),h&&h.textContent!==e.weight&&(h.textContent=e.weight)}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),window.clearTimeout(this.snapTimeoutId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.filmFrames=[]}}class et{container;products;onSelectProduct;wrapper;reelTrack;tickElements=[];slatItems=[];currentX=0;targetX=0;velocity=0;lastX=0;lerpFactor=.075;defaultSlatWidth=85;expandedSlatWidth=320;slatGap=10;singleSetWidth=0;totalCopies=3;activeHoveredIndex=null;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetX=0;lastClientX=0;lastDragTime=0;dragVelocity=0;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.calculateDimensions(),this.buildDOM(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}calculateDimensions(){const t=window.innerWidth;t<600?(this.defaultSlatWidth=58,this.expandedSlatWidth=240,this.slatGap=6):t<1024?(this.defaultSlatWidth=72,this.expandedSlatWidth=280,this.slatGap=8):(this.defaultSlatWidth=85,this.expandedSlatWidth=320,this.slatGap=10),this.singleSetWidth=this.products.length*(this.defaultSlatWidth+this.slatGap)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="ab-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Aristide Benoist Accordion Slats Reel Showcase");const i=Array.from({length:42}).map((e,s)=>`<span class="ab-tick" data-tick="${s}"></span>`).join("");this.wrapper.innerHTML=`
      <!-- Top Brutalist Header Bar (Aristide Benchmark) -->
      <header class="ab-header" aria-hidden="true">
        <div class="ab-header__brand">AGRUMÊA</div>
        
        <!-- Aristide Signature Central Acoustic/Scrub Tick Meter -->
        <div class="ab-header__meter" id="abTickMeter">
          ${i}
        </div>

        <div class="ab-header__meta">DISPENSA // 1894</div>
      </header>

      <!-- Center Infinite Slat Reel Viewport -->
      <div class="ab-viewport" id="abViewport">
        <div class="ab-track" id="abTrack">
          <!-- Slats injected dynamically in 3 sets for infinite wrap -->
        </div>
      </div>

      <!-- Bottom Minimalist Footer (Aristide Benchmark) -->
      <footer class="ab-footer" aria-hidden="true">
        <div class="ab-footer__col">
          <span>ARTISANAL SICILIAN HARVEST</span>
          <span class="ab-footer__sub">AVAILABLE DISPENSA 2026</span>
        </div>

        <div class="ab-footer__hint">
          <span>DRAG // SCROLL // HOVER SLAT TO EXPAND</span>
        </div>

        <div class="ab-footer__col ab-footer__col--right">
          <span>MOUNT ETNA TERROIR</span>
          <span class="ab-footer__sub">100% ORGANIC BOTANICALS</span>
        </div>
      </footer>
    `,this.container.appendChild(this.wrapper),this.reelTrack=this.wrapper.querySelector("#abTrack"),this.tickElements=Array.from(this.wrapper.querySelectorAll(".ab-tick"));for(let e=0;e<this.totalCopies;e++)this.products.forEach((s,a)=>{const r=e*this.products.length+a,l=String(a+1).padStart(2,"0"),c=document.createElement("article");c.className="ab-slat",c.dataset.globalIndex=String(r),c.dataset.productIndex=String(a),c.dataset.slug=s.slug,c.innerHTML=`
          <div class="ab-slat__inner">
            <!-- Background Image Crop (Monochrome duotone in idle, color in hover) -->
            <div class="ab-slat__bg">
              <img 
                class="ab-slat__img" 
                src="${s.jarUrl}" 
                alt="${s.title}" 
                loading="${r<8?"eager":"lazy"}" 
                decoding="async" 
                draggable="false"
              />
            </div>

            <!-- Idle Slat Spine Label (Vertical Numeral & Category) -->
            <div class="ab-slat__spine">
              <span class="ab-slat__num">${l}</span>
              <span class="ab-slat__cat-vert">${s.category.toUpperCase()}</span>
            </div>

            <!-- Expanded State Monograph Overlay -->
            <div class="ab-slat__expanded-content">
              <div class="ab-slat__halo"></div>
              <div class="ab-slat__meta-top">
                <span class="ab-slat__sec-id">SEC // ${l}</span>
                <span class="ab-slat__weight">${s.weight}</span>
              </div>

              <div class="ab-slat__title-block">
                <h2 class="ab-slat__title">${s.title}</h2>
                <p class="ab-slat__latin">${s.latinSubtitle}</p>
              </div>

              <div class="ab-slat__footer-row">
                <span class="ab-slat__price">${s.price}</span>
                <button class="ab-slat__cta-btn" type="button" data-slug="${s.slug}">
                  <span>EXPLORE</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </button>
              </div>
            </div>
          </div>
        `,c.addEventListener("mouseenter",()=>{this.setHoveredSlat(r)}),c.addEventListener("mouseleave",()=>{this.activeHoveredIndex===r&&this.setHoveredSlat(null)}),c.addEventListener("click",n=>{if(this.hasDragged){n.preventDefault();return}n.target.closest(".ab-slat__cta-btn")||this.activeHoveredIndex===r?this.onSelectProduct&&this.onSelectProduct(s):(this.setHoveredSlat(r),this.centerOnSlat(r))}),this.reelTrack.appendChild(c),this.slatItems.push({element:c,product:s,index:r,baseWidth:this.defaultSlatWidth,expandedWidth:this.expandedSlatWidth})})}setHoveredSlat(t){this.activeHoveredIndex=t,this.slatItems.forEach(i=>{i.index===t?i.element.classList.add("is-expanded"):i.element.classList.remove("is-expanded")})}centerOnSlat(t){const i=this.defaultSlatWidth+this.slatGap,e=t*i+i/2,s=window.innerWidth/2;this.targetX=-(e-s)}bindEvents(){const t=(c,n,h,d)=>{c.addEventListener(n,h,d),this.boundEvents.push({target:c,type:n,handler:h,options:d})},i=c=>{if(!c.target.closest("button, .ab-header, .ab-footer")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=c.clientX,this.startClientY=c.clientY,this.lastClientX=c.clientX,this.lastDragTime=performance.now(),this.startTargetX=this.targetX,this.dragVelocity=0;try{c.target.setPointerCapture(c.pointerId)}catch{}}},e=c=>{if(!this.isDragging)return;const n=c.clientX-this.startClientX,h=c.clientY-this.startClientY;!this.hasDragged&&(Math.abs(n)>6||Math.abs(h)>6)&&(this.hasDragged=!0),this.targetX=this.startTargetX+n*1.15;const d=performance.now(),p=Math.max(1,d-this.lastDragTime),u=c.clientX-this.lastClientX;this.dragVelocity=u/p*16.67,this.lastClientX=c.clientX,this.lastDragTime=d},s=c=>{if(this.isDragging){this.isDragging=!1;try{c.target.releasePointerCapture(c.pointerId)}catch{}Math.abs(this.dragVelocity)>3&&(this.targetX+=this.dragVelocity*14)}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=c=>{c.preventDefault();const n=Math.abs(c.deltaX)>Math.abs(c.deltaY)?c.deltaX:c.deltaY,h=1.35;this.targetX-=n*h};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",c=>{const n=this.defaultSlatWidth+this.slatGap;c.key==="ArrowRight"?(c.preventDefault(),this.targetX-=n*2):c.key==="ArrowLeft"&&(c.preventDefault(),this.targetX+=n*2)}),t(window,"resize",()=>{this.calculateDimensions()})}loop(){if(this.isRunning){if(this.currentX+=(this.targetX-this.currentX)*this.lerpFactor,this.velocity=(this.currentX-this.lastX)*60,this.lastX=this.currentX,this.singleSetWidth>0){for(;this.currentX>0;)this.currentX-=this.singleSetWidth,this.targetX-=this.singleSetWidth;for(;this.currentX<-this.singleSetWidth;)this.currentX+=this.singleSetWidth,this.targetX+=this.singleSetWidth}if(this.reelTrack){const t=Math.max(-2.5,Math.min(2.5,-this.velocity*.08));this.reelTrack.style.transform=`translate3d(${this.currentX.toFixed(1)}px, 0, 0) skewX(${t.toFixed(2)}deg)`}this.renderTicks(),this.animationFrameId=requestAnimationFrame(this.loop)}}renderTicks(){if(!this.tickElements.length||this.singleSetWidth<=0)return;const i=(-this.currentX%this.singleSetWidth+this.singleSetWidth)%this.singleSetWidth/this.singleSetWidth,e=this.tickElements.length,s=Math.floor(i*e);for(let a=0;a<e;a++){const r=this.tickElements[a],l=Math.abs(a-s);l===0?(r.style.background="var(--color-orange)",r.style.height="14px",r.style.opacity="1"):l===1?(r.style.background="rgba(229, 90, 43, 0.7)",r.style.height="11px",r.style.opacity="0.75"):l===2?(r.style.background="rgba(253, 243, 235, 0.5)",r.style.height="8px",r.style.opacity="0.45"):(r.style.background="rgba(253, 243, 235, 0.2)",r.style.height="6px",r.style.opacity="0.25")}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.slatItems=[],this.tickElements=[]}}function it(){const o=document.createElement("div");o.className="view-home",o.innerHTML=`
    <!-- Active Carousel Mounting Stage -->
    <div class="carousel-stage" id="carouselStage" style="position:relative; width:100vw; height:100vh; overflow:hidden;"></div>

    <!-- Floating Mode Switcher Dock -->
    <nav class="carousel-mode-dock" aria-label="Carousel Experience Switcher">
      <button class="carousel-mode-dock__btn is-active" data-mode="incline" type="button" aria-label="10° Incline Marquee mode">
        <span class="carousel-mode-dock__btn-icon">✦</span>
        <span>10° Incline</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="liquid" type="button" aria-label="WebGL Liquid Shader mode">
        <span class="carousel-mode-dock__btn-icon">≋</span>
        <span>Liquid GL</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="deck" type="button" aria-label="Elastic Card Deck mode">
        <span class="carousel-mode-dock__btn-icon">❐</span>
        <span>Card Deck</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="activetheory" type="button" aria-label="Active Theory 3D Ribbon mode">
        <span class="carousel-mode-dock__btn-icon">⟁</span>
        <span>Active Theory 3D</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="split" type="button" aria-label="Bi-Directional Editorial Split mode">
        <span class="carousel-mode-dock__btn-icon">⧉</span>
        <span>Editorial Split</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="orbital" type="button" aria-label="Off-Screen Orbital Sundial Arc mode">
        <span class="carousel-mode-dock__btn-icon">◌</span>
        <span>Orbital Arc</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="a24" type="button" aria-label="A24 35mm Cinema Film Strip mode">
        <span class="carousel-mode-dock__btn-icon">🎞</span>
        <span>A24 Cinema</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="aristide" type="button" aria-label="Aristide Benoist Accordion Slats mode">
        <span class="carousel-mode-dock__btn-icon">☌</span>
        <span>Aristide Slats</span>
      </button>
    </nav>
  `;let t=null,i="incline";const e=a=>{window.history.pushState({},"",`/dispensa/${a.slug}`),window.dispatchEvent(new PopStateEvent("popstate"))},s=a=>{const r=o.querySelector("#carouselStage");if(r){if(t&&(t.destroy(),t=null),r.innerHTML="",i=a,o.querySelectorAll(".carousel-mode-dock__btn").forEach(l=>{if(l.dataset.mode===a){l.classList.add("is-active");try{l.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})}catch{}}else l.classList.remove("is-active")}),a==="incline"){r.innerHTML=`
        <section class="jar-slider" id="jarSlider" data-jar-slider data-anim="hero" data-jar-slider-ready="true">
          <h1 class="visually-hidden">Agrumêa Farm: Artisanal Sicilian preserves, marmalades, sweet spreads and delicacies</h1>

          <!-- Deep Burgundy Geometric Arch Layer -->
          <div class="jar-slider__shape-layer" id="shapeLayer" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
            
            <!-- Revolving Terracotta Typographic Seal -->
            <div class="jar-slider__badge jar-slider__badge--artwork" id="sliderBadge">
              <img class="jar-slider__badge-artwork" src="/images/home/circle-text-en.svg" width="1169" height="1169" alt="" decoding="async">
            </div>
          </div>

          <!-- Center Lower Discovery Prompt -->
          <div class="jar-slider__overlay">
            <p class="jar-slider__prompt is-ready">Scroll or Drag to explore</p>
          </div>

          <!-- 10° Diagonal Marquee Track & Cutout Glass Jars -->
          <div class="jar-slider__wrapper" id="sliderWrapper" data-jar-slider-wrap>
            <div class="jar-slider__marquee" id="sliderMarquee">
              <div class="jar-slider__track" id="sliderTrack" data-jar-slider-track></div>
            </div>
          </div>
        </section>
      `;const l=r.querySelector("#sliderWrapper"),c=r.querySelector("#sliderTrack"),n=r.querySelector("#sliderBadge");l&&c&&(t=new j({wrapper:l,track:c,badge:n,products:y,inclineAngle:10,onSelectProduct:e}))}else if(a==="liquid"){r.innerHTML=`
        <div class="webgl-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.45; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="webglMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#webglMount");t=new G({container:l,products:y,onSelectProduct:e})}else if(a==="deck"){r.innerHTML=`
        <div class="deck-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.45; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="deckMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#deckMount");t=new Z({container:l,products:y,onSelectProduct:e})}else if(a==="activetheory"){r.innerHTML=`
        <div class="activetheory-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.35; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="atMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#atMount");t=new Q({container:l,products:y,onSelectProduct:e})}else if(a==="split"){r.innerHTML=`
        <div class="split-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.25; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="splitMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#splitMount");t=new J({container:l,products:y,onSelectProduct:e})}else if(a==="orbital"){r.innerHTML=`
        <div class="orbital-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.25; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="orbitalMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#orbitalMount");t=new K({container:l,products:y,onSelectProduct:e})}else if(a==="a24"){r.innerHTML=`
        <div class="a24-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="a24Mount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#a24Mount");t=new tt({container:l,products:y,onSelectProduct:e})}else if(a==="aristide"){r.innerHTML=`
        <div class="aristide-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="aristideMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const l=r.querySelector("#aristideMount");t=new et({container:l,products:y,onSelectProduct:e})}}};return o.querySelectorAll(".carousel-mode-dock__btn").forEach(a=>{a.addEventListener("click",r=>{const l=r.currentTarget.dataset.mode||"incline";l!==i&&s(l)})}),setTimeout(()=>{s("incline")},0),o}function st(){const o=document.createElement("div");return o.className="page-container",o.innerHTML=`
    <header class="page-header">
      <span class="page-eyebrow">Artisanal Harvest • Sicily</span>
      <h1 class="page-title">The Botanical Pantry</h1>
      <p class="page-desc">
        Artisanal preserves, marmalades, sweet spreads, and delicacies crafted in small batches from organic crops grown on the volcanic slopes of Mount Etna.
      </p>
    </header>

    <div class="filter-tabs">
      <button class="filter-tab active" data-filter="all">All Preserves</button>
      <button class="filter-tab" data-filter="sweet">Sweet & Jams</button>
      <button class="filter-tab" data-filter="savory">Savory Delights</button>
      <button class="filter-tab" data-filter="spread">Sweet Spreads</button>
      <button class="filter-tab" data-filter="condiment">Condiments</button>
    </div>

    <div class="product-grid" id="catalogGrid"></div>
  `,setTimeout(()=>{const t=o.querySelector("#catalogGrid"),i=o.querySelectorAll(".filter-tab");if(!t)return;function e(s){t&&(t.innerHTML=s.map(a=>`
        <article class="product-card" data-category="${a.category}">
          <div class="product-card__thumb">
            <img src="${a.jarUrl||a.image}" alt="${a.title}" loading="lazy" />
          </div>
          <span class="product-card__category">${a.category.toUpperCase()} • ${a.weight}</span>
          <h2 class="product-card__title">${a.title}</h2>
          <p class="product-card__desc">${a.description}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${a.price}</span>
            <a href="/dispensa/${a.slug}" class="product-card__btn">View Details</a>
          </div>
        </article>
      `).join(""))}e(y),i.forEach(s=>{s.addEventListener("click",()=>{i.forEach(r=>r.classList.remove("active")),s.classList.add("active");const a=s.dataset.filter;e(a==="all"?y:y.filter(r=>r.category===a))})})},0),o}function at(o){const t=document.createElement("div"),i=o.slug||"smeraldo",e=y.find(s=>s.slug===i)||y[0];return t.innerHTML=`
    <div class="product-detail">
      <div class="product-detail__stage">
        <span class="product-detail__badge">CERTIFIED ORGANIC • 100% SICILIAN</span>
        <img src="${e.jarUrl||e.image}" alt="${e.title}" />
      </div>

      <div class="product-detail__info">
        <span class="product-card__category" style="font-size:0.85rem; margin-bottom:12px; display:block;">
          ${e.category.toUpperCase()} • ${e.weight}
        </span>
        <h1 class="page-title" style="text-align:left; margin-bottom:12px;">${e.title}</h1>
        <p style="font-family:var(--font-serif); font-size:1.15rem; color:var(--color-orange); margin-bottom:24px;">
          ${e.latinSubtitle}
        </p>

        <p class="page-desc" style="text-align:left; margin:0 0 28px 0;">
          ${e.description}
        </p>

        <div style="margin-bottom:32px;">
          <h3 style="font-family:var(--font-serif); font-size:1rem; color:var(--color-border); margin-bottom:12px;">
            Natural Ingredients:
          </h3>
          <ul style="padding-left:20px; line-height:1.8; color:var(--color-text-muted); font-size:0.95rem;">
            ${e.ingredients.map(s=>`<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div style="display:flex; align-items:center; gap:24px; padding-top:24px; border-top:1px solid rgba(118,37,48,0.15);">
          <span style="font-family:var(--font-serif); font-size:2rem; font-weight:700; color:var(--color-border);">
            ${e.price}
          </span>
          <button id="btnAddToCart" class="btn-shop" style="padding:16px 36px; font-size:0.95rem; cursor:pointer;">
            Add to Cart
          </button>
        </div>

        <div style="margin-top:28px;">
          <a href="/dispensa" style="font-family:var(--font-serif); font-size:0.85rem; color:var(--color-orange); letter-spacing:0.1em; text-decoration:none;">
            ← BACK TO THE PANTRY
          </a>
        </div>
      </div>
    </div>
  `,setTimeout(()=>{const s=t.querySelector("#btnAddToCart");s?.addEventListener("click",()=>{s.textContent="Added! ✓",setTimeout(()=>s.textContent="Add to Cart",2e3)})},0),t}function M(o="produzione"){const t=document.createElement("div");t.className="page-container";const i={produzione:{eyebrow:"Tradition & Method • Sicily",title:"Our Production Method",desc:"From volcanic soil to glass jar: honoring natural seasonal rhythms and gentle low-temperature cooking in copper kettles."},"chi-siamo":{eyebrow:"Generations of Growers",title:"Our Story",desc:"Custodians of Mount Etna's biodiversity since 1892. Cultivating passion, ancestral roots, and pure Sicilian authenticity."},experience:{eyebrow:"Tours & Guided Tastings",title:"The Farm Experience",desc:"Stroll among our century-old citrus groves and discover the timeless secrets of artisanal Sicilian preserve making."}}[o];return t.innerHTML=`
    <header class="page-header">
      <span class="page-eyebrow">${i.eyebrow}</span>
      <h1 class="page-title">${i.title}</h1>
      <p class="page-desc">${i.desc}</p>
    </header>

    <div class="story-timeline">
      <div class="story-item">
        <div class="story-item__media">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" alt="Orchard" loading="lazy" />
        </div>
        <div class="story-item__info">
          <div class="story-item__num">01</div>
          <h2 class="story-item__title">Sun-Drenched Dawn Harvest</h2>
          <p class="page-desc" style="text-align:left;">
            Every single citrus fruit and organic crop is hand-picked at daybreak at its peak sugar and aromatic maturity, ensuring optimal natural pectin and essential oils.
          </p>
        </div>
      </div>

      <div class="story-item">
        <div class="story-item__media">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80" alt="Craft Laboratory" loading="lazy" />
        </div>
        <div class="story-item__info">
          <div class="story-item__num">02</div>
          <h2 class="story-item__title">Low-Temperature Vacuum Cooking</h2>
          <p class="page-desc" style="text-align:left;">
            Slow gentle reduction preserves vivid fruit colors, natural vitamins, and delicate volatile citrus aromas without charring natural sugars.
          </p>
        </div>
      </div>

      <div class="story-item">
        <div class="story-item__media">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" alt="Pure Preserves" loading="lazy" />
        </div>
        <div class="story-item__info">
          <div class="story-item__num">03</div>
          <h2 class="story-item__title">Hand-Sealed Glass Jars</h2>
          <p class="page-desc" style="text-align:left;">
            Zero artificial preservatives or chemicals. Only ancestral Sicilian knowledge combining gentle heat with the natural acidity of fresh citrus.
          </p>
        </div>
      </div>
    </div>
  `,t}function rt(){const o=document.createElement("div");return o.className="page-container",o.innerHTML=`
    <header class="page-header">
      <span class="page-eyebrow">Get in Touch • Inquiries & Orders</span>
      <h1 class="page-title">Contact the Estate</h1>
      <p class="page-desc">
        We are at your service for questions about our botanical preserves, bespoke wholesale orders, and guided estate tours.
      </p>
    </header>

    <div class="contact-container">
      <div class="contact-card">
        <h3 style="font-family:var(--font-serif); font-size:1.4rem; color:var(--color-border); margin-bottom:20px;">
          Estate & Laboratory
        </h3>

        <div style="margin-bottom:24px; line-height:1.7; color:var(--color-text-muted);">
          <strong style="color:var(--color-border); font-family:var(--font-serif);">Floridia Estate:</strong><br/>
          Seconda strada c.da Piana S. Croce sn<br/>
          96014 Floridia (SR), Sicily — Italy
        </div>

        <div style="margin-bottom:24px; line-height:1.7; color:var(--color-text-muted);">
          <strong style="color:var(--color-border); font-family:var(--font-serif);">Catania Offices:</strong><br/>
          Via Generale Ameglio, 13<br/>
          95123 Catania (CT), Sicily
        </div>

        <div style="margin-bottom:24px; line-height:1.7; color:var(--color-text-muted);">
          <strong style="color:var(--color-border); font-family:var(--font-serif);">Direct Contacts:</strong><br/>
          Email: info@agrumeafarm-template.com<br/>
          Tel: +39 095 812 3456
        </div>

        <div style="padding:16px; background:rgba(233,78,27,0.06); border-radius:12px; border:1px solid rgba(233,78,27,0.2);">
          <span style="font-size:0.75rem; letter-spacing:0.1em; color:var(--color-orange); text-transform:uppercase; font-weight:600;">
            • LOCAL SICILIAN TIME:
          </span>
          <div id="sicilyClock" style="font-family:var(--font-serif); font-size:1.1rem; color:var(--color-border); margin-top:4px;">
            14:30 CET
          </div>
        </div>
      </div>

      <div class="contact-card">
        <form id="contactForm">
          <div class="form-group">
            <label class="form-label" for="contactName">Full Name</label>
            <input type="text" id="contactName" class="form-input" placeholder="e.g. Eleanor Vance" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="contactEmail">Email Address</label>
            <input type="email" id="contactEmail" class="form-input" placeholder="eleanor@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="contactSubject">Subject</label>
            <select id="contactSubject" class="form-input">
              <option value="dispensa">Pantry Catalog Inquiry</option>
              <option value="visite">Book an Estate Visit / Tasting</option>
              <option value="horeca">Wholesale & Culinary Supply</option>
              <option value="altro">General Inquiries</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="contactMessage">Message</label>
            <textarea id="contactMessage" class="form-textarea" rows="4" placeholder="How may we assist you today?" required></textarea>
          </div>

          <button type="submit" class="btn-submit">
            Send Message
          </button>
        </form>
      </div>
    </div>
  `,setTimeout(()=>{const t=o.querySelector("#contactForm");t?.addEventListener("submit",e=>{e.preventDefault();const s=t.querySelector(".btn-submit");s&&(s.textContent="Message Sent Successfully! ✓",s.style.backgroundColor="#2f743e",setTimeout(()=>{s.textContent="Send Message",s.style.backgroundColor="",t.reset()},3e3))});const i=o.querySelector("#sicilyClock");if(i){const e=()=>{const s=new Date;i.textContent=s.toLocaleTimeString("en-US",{timeZone:"Europe/Rome"})+" (Sicily, CET)"};e(),setInterval(e,1e3)}},0),o}document.addEventListener("DOMContentLoaded",()=>{const o=document.getElementById("viewMount");if(!o)return;const t=new U;new q;const i=new V(o);i.register("/",()=>it(),"Agrumêa Farm — Artisanal Sicilian Experience"),i.register("/dispensa",()=>st(),"The Botanical Pantry — Agrumêa Farm"),i.register("/dispensa/:slug",r=>at(r),"Product Detail — Agrumêa Farm"),i.register("/produzione",()=>M("produzione"),"Heritage & Method — Agrumêa Farm"),i.register("/experience",()=>M("experience"),"Tastings & Visits — Agrumêa Farm"),i.register("/chi-siamo",()=>M("chi-siamo"),"Our Story — Generations of Passion"),i.register("/contatti",()=>rt(),"Contact & Estate — Agrumêa Farm"),i.handleCurrentRoute();const e=document.getElementById("siteMenuToggle"),s=document.querySelectorAll(".fp-nav__link"),a=()=>{document.body.classList.remove("is-nav-open");const r=document.getElementById("siteFullPageNav");r&&r.setAttribute("aria-hidden","true")};e&&e.addEventListener("click",()=>{const r=document.body.classList.toggle("is-nav-open"),l=document.getElementById("siteFullPageNav");l&&l.setAttribute("aria-hidden",(!r).toString())}),s.forEach(r=>{r.addEventListener("click",l=>{l.preventDefault(),a();const c=r.getAttribute("href")||"/";i.navigateTo(c),s.forEach(n=>n.classList.remove("is-active")),r.classList.add("is-active")})}),t.bindInteractive(document.querySelectorAll("a, button"),"EXPLORE"),t.bindInteractive(document.querySelectorAll(".site-menu-toggle"),"MENU"),t.bindInteractive(document.querySelectorAll(".site-header__brand"),"HOME"),t.bindInteractive(document.querySelectorAll(".jar-slider__item"),"PANTRY")});
