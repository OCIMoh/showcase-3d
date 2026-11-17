(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&e(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function e(s){if(s.ep)return;s.ep=!0;const a=i(s);fetch(s.href,a)}})();var k="1.3.27";function A(o,t,i){return Math.max(o,Math.min(t,i))}function B(o,t,i){return(1-i)*o+i*t}function N(o,t,i,e){return B(o,t,1-Math.exp(-i*e))}function W(o,t){return(o%t+t)%t}var F=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(o){if(!this.isRunning)return;let t=!1;if(this.duration&&this.easing){this.currentTime+=o;const i=A(0,this.currentTime/this.duration,1);t=i>=1;const e=t?1:this.easing(i);this.value=this.from+(this.to-this.from)*e}else this.lerp?(this.value=N(this.value,this.to,this.lerp*60,o),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,t=!0)):(this.value=this.to,t=!0);t&&this.stop(),this.onUpdate?.(this.value,t)}stop(){this.isRunning=!1}fromTo(o,t,{lerp:i,duration:e,easing:s,onStart:a,onUpdate:r}){this.from=this.value=o,this.to=t,this.lerp=i,this.duration=e,this.easing=s,this.currentTime=0,this.isRunning=!0,a?.(),this.onUpdate=r}};function q(o,t){let i;return function(...e){clearTimeout(i),i=setTimeout(()=>{i=void 0,o.apply(this,e)},t)}}var H=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(o,t,{autoResize:i=!0,debounce:e=250}={}){this.wrapper=o,this.content=t,i&&(this.debouncedResize=q(this.resize,e),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},D=class{events={};emit(o,...t){const i=this.events[o]||[];for(let e=0,s=i.length;e<s;e++)i[e]?.(...t)}on(o,t){return this.events[o]?this.events[o].push(t):this.events[o]=[t],()=>{this.events[o]=this.events[o]?.filter(i=>t!==i)}}off(o,t){this.events[o]=this.events[o]?.filter(i=>t!==i)}destroy(){this.events={}}};const z=100/6,_={passive:!1};function I(o,t){return o===1?z:o===2?t:1}var U=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new D;constructor(o,t={wheelMultiplier:1,touchMultiplier:1}){this.element=o,this.options=t,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,_),this.element.addEventListener("touchstart",this.onTouchStart,_),this.element.addEventListener("touchmove",this.onTouchMove,_),this.element.addEventListener("touchend",this.onTouchEnd,_)}on(o,t){return this.emitter.on(o,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,_),this.element.removeEventListener("touchstart",this.onTouchStart,_),this.element.removeEventListener("touchmove",this.onTouchMove,_),this.element.removeEventListener("touchend",this.onTouchEnd,_)}onTouchStart=o=>{const{clientX:t,clientY:i}=o.targetTouches?o.targetTouches[0]:o;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:o})};onTouchMove=o=>{const{clientX:t,clientY:i}=o.targetTouches?o.targetTouches[0]:o,e=-(t-this.touchStart.x)*this.options.touchMultiplier,s=-(i-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=i,this.lastDelta={x:e,y:s},this.emitter.emit("scroll",{deltaX:e,deltaY:s,event:o})};onTouchEnd=o=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:o})};onWheel=o=>{let{deltaX:t,deltaY:i,deltaMode:e}=o;const s=I(e,this.window.width),a=I(e,this.window.height);t*=s,i*=a,t*=this.options.wheelMultiplier,i*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:i,event:o})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}};const P=o=>Math.min(1,1.001-2**(-10*o));var V=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;_isDraggingSelection=!1;reducedMotionMediaQuery=window.matchMedia("(prefers-reduced-motion: reduce)");isTouching;isIos;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new F;emitter=new D;dimensions;virtualScroll;constructor({wrapper:o=window,content:t=document.documentElement,eventsTarget:i=o,smoothWheel:e=!0,syncTouch:s=!1,syncTouchLerp:a=.075,touchInertiaExponent:r=1.7,duration:c,easing:l,lerp:n=.1,infinite:p=!1,orientation:h="vertical",gestureOrientation:d=h==="horizontal"?"both":"vertical",touchMultiplier:u=1,wheelMultiplier:m=1,autoResize:g=!0,prevent:v,virtualScroll:f,overscroll:b=!0,autoRaf:y=!1,anchors:S=!1,autoToggle:x=!1,allowNestedScroll:C=!1,__experimental__naiveDimensions:T=!1,naiveDimensions:X=T,stopInertiaOnNavigate:O=!1,respectReducedMotion:$=!0}={}){window.lenisVersion=k,window.lenis||(window.lenis={}),window.lenis.version=k,h==="horizontal"&&(window.lenis.horizontal=!0),s===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!o||o===document.documentElement)&&(o=window),typeof c=="number"&&typeof l!="function"?l=P:typeof l=="function"&&typeof c!="number"&&(c=1),this.options={wrapper:o,content:t,eventsTarget:i,smoothWheel:e,syncTouch:s,syncTouchLerp:a,touchInertiaExponent:r,duration:c,easing:l,lerp:n,infinite:p,gestureOrientation:d,orientation:h,touchMultiplier:u,wheelMultiplier:m,autoResize:g,prevent:v,virtualScroll:f,overscroll:b,autoRaf:y,anchors:S,autoToggle:x,allowNestedScroll:C,naiveDimensions:X,stopInertiaOnNavigate:O,respectReducedMotion:$},this.dimensions=new H(o,t,{autoResize:g}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new U(i,{touchMultiplier:u,wheelMultiplier:m}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(o,t){return this.emitter.on(o,t)}off(o,t){return this.emitter.off(o,t)}onScrollEnd=o=>{o instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&o.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){const o=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[o]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=o=>{o.propertyName?.includes("overflow")&&o.target===this.rootElement&&this.checkOverflow()};setScroll(o){this.isHorizontal?this.options.wrapper.scrollTo({left:o,behavior:"instant"}):this.options.wrapper.scrollTo({top:o,behavior:"instant"})}onClick=o=>{const t=o.composedPath().filter(e=>e instanceof HTMLAnchorElement&&e.href).map(e=>new URL(e.href)),i=new URL(window.location.href);if(this.options.anchors){const e=t.find(s=>i.host===s.host&&i.pathname===s.pathname&&s.hash);if(e){const s=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,a=decodeURIComponent(e.hash);this.scrollTo(a,s);return}}if(this.options.stopInertiaOnNavigate&&t.some(e=>i.host===e.host&&i.pathname!==e.pathname)){this.reset();return}};onPointerDown=o=>{o.button===1&&this.reset()};isTouchOnSelectionHandle(o){const t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return!1;const i=o.targetTouches[0]??o.changedTouches[0];if(!i)return!1;const e=t.getRangeAt(0).getClientRects();if(e.length===0)return!1;const s=e[0],a=e[e.length-1],r=40,c=Math.hypot(i.clientX-s.left,i.clientY-s.top)<=r,l=Math.hypot(i.clientX-a.right,i.clientY-a.bottom)<=r;return c||l}onVirtualScroll=o=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(o)===!1)return;const{deltaX:t,deltaY:i,event:e}=o;if(this.emitter.emit("virtual-scroll",{deltaX:t,deltaY:i,event:e}),e.ctrlKey||e.lenisStopPropagation)return;const s=e.type.includes("touch"),a=e.type.includes("wheel");if(s&&this.isIos&&(e.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(e)),this._isDraggingSelection)){e.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=e.type==="touchstart"||e.type==="touchmove";const r=t===0&&i===0;if(this.options.syncTouch&&s&&e.type==="touchstart"&&r&&!this.isStopped&&!this.isLocked){this.reset();return}const c=this.options.gestureOrientation==="vertical"&&i===0||this.options.gestureOrientation==="horizontal"&&t===0;if(r||c)return;let l=e.composedPath();l=l.slice(0,l.indexOf(this.rootElement));const n=this.options.prevent,p=Math.abs(t)>=Math.abs(i)?"horizontal":"vertical";if(l.find(m=>m instanceof HTMLElement&&(typeof n=="function"&&n?.(m)||m.hasAttribute?.("data-lenis-prevent")||p==="vertical"&&m.hasAttribute?.("data-lenis-prevent-vertical")||p==="horizontal"&&m.hasAttribute?.("data-lenis-prevent-horizontal")||s&&m.hasAttribute?.("data-lenis-prevent-touch")||a&&m.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.hasNestedScroll(m,{deltaX:t,deltaY:i}))))return;if(this.isStopped||this.isLocked){e.cancelable&&e.preventDefault();return}if(!(this.options.syncTouch&&s||this.options.smoothWheel&&a)){this.isScrolling="native",this.animate.stop(),e.lenisStopPropagation=!0;return}let h=i;this.options.gestureOrientation==="both"?h=Math.abs(i)>Math.abs(t)?i:t:this.options.gestureOrientation==="horizontal"&&(h=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&i>0||this.animatedScroll===this.limit&&i<0))&&(e.lenisStopPropagation=!0),e.cancelable&&e.preventDefault();const d=s&&this.options.syncTouch,u=s&&e.type==="touchend";u&&(h=Math.sign(h)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+h,{programmatic:!1,...d?{lerp:u?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const o=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-o,this.direction=Math.sign(this.animatedScroll-o),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=o=>{const t=o-(this.time||o);this.time=o,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(o,{offset:t=0,immediate:i=!1,lock:e=!1,programmatic:s=!0,lerp:a=s?this.options.lerp:void 0,duration:r=s?this.options.duration:void 0,easing:c=s?this.options.easing:void 0,onStart:l,onComplete:n,force:p=!1,userData:h}={}){if(this.prefersReducedMotion&&(s?i=!0:(a=1,r=void 0,c=void 0)),(this.isStopped||this.isLocked)&&!p)return;let d=o,u=t;if(typeof d=="string"&&["top","left","start","#"].includes(d))d=0;else if(typeof d=="string"&&["bottom","right","end"].includes(d))d=this.limit;else{let m=null;if(typeof d=="string"?(m=d.startsWith("#")?document.getElementById(d.slice(1)):document.querySelector(d),m||(d==="#top"?d=0:console.warn("Lenis: Target not found",d))):d instanceof Element&&(m=d),m){if(this.options.wrapper!==window){const S=this.rootElement.getBoundingClientRect();u-=this.isHorizontal?S.left:S.top}const g=m.getBoundingClientRect(),v=getComputedStyle(m),f=this.isHorizontal?Number.parseFloat(v.scrollMarginLeft):Number.parseFloat(v.scrollMarginTop),b=getComputedStyle(this.rootElement),y=this.isHorizontal?Number.parseFloat(b.scrollPaddingLeft):Number.parseFloat(b.scrollPaddingTop);d=(this.isHorizontal?g.left:g.top)+this.animatedScroll-(Number.isNaN(f)?0:f)-(Number.isNaN(y)?0:y)}}if(typeof d=="number"){if(d+=u,this.options.infinite){if(s){this.targetScroll=this.animatedScroll=this.scroll;const m=d-this.animatedScroll;m>this.limit/2?d-=this.limit:m<-this.limit/2&&(d+=this.limit)}}else d=A(0,d,this.limit);if(d===this.targetScroll){l?.(this),n?.(this);return}if(this.userData=h??{},i){this.animatedScroll=this.targetScroll=d,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),n?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}s||(this.targetScroll=d),typeof r=="number"&&typeof c!="function"?c=P:typeof c=="function"&&typeof r!="number"&&(r=1),this.animate.fromTo(this.animatedScroll,d,{duration:r,easing:c,lerp:a,onStart:()=>{e&&(this.isLocked=!0),this.isScrolling="smooth",l?.(this)},onUpdate:(m,g)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=m-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=m,this.setScroll(this.scroll),s&&(this.targetScroll=m),g||this.emit(),g&&(this.reset(),this.emit(),n?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(o,{deltaX:t,deltaY:i}){const e=Date.now();o._lenis||(o._lenis={});const s=o._lenis;let a,r,c,l,n,p,h,d,u,m;if(e-(s.time??0)>2e3){s.time=Date.now();const C=window.getComputedStyle(o);if(s.computedStyle=C,a=["auto","overlay","scroll"].includes(C.overflowX),r=["auto","overlay","scroll"].includes(C.overflowY),n=["auto"].includes(C.overscrollBehaviorX),p=["auto"].includes(C.overscrollBehaviorY),s.hasOverflowX=a,s.hasOverflowY=r,!(a||r))return!1;h=o.scrollWidth,d=o.scrollHeight,u=o.clientWidth,m=o.clientHeight,c=h>u,l=d>m,s.isScrollableX=c,s.isScrollableY=l,s.scrollWidth=h,s.scrollHeight=d,s.clientWidth=u,s.clientHeight=m,s.hasOverscrollBehaviorX=n,s.hasOverscrollBehaviorY=p}else c=s.isScrollableX,l=s.isScrollableY,a=s.hasOverflowX,r=s.hasOverflowY,h=s.scrollWidth,d=s.scrollHeight,u=s.clientWidth,m=s.clientHeight,n=s.hasOverscrollBehaviorX,p=s.hasOverscrollBehaviorY;if(!(a&&c||r&&l))return!1;const g=Math.abs(t)>=Math.abs(i)?"horizontal":"vertical";let v,f,b,y,S,x;if(g==="horizontal")v=Math.round(o.scrollLeft),f=h-u,b=t,y=a,S=c,x=n;else if(g==="vertical")v=Math.round(o.scrollTop),f=d-m,b=i,y=r,S=l,x=p;else return!1;return!x&&(v>=f||v<=0)?!0:(b>0?v<f:v>0)&&y&&S}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const o=this.options.wrapper;return this.isHorizontal?o.scrollX??o.scrollLeft:o.scrollY??o.scrollTop}get scroll(){return this.options.infinite?W(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(o){this._isScrolling!==o&&(this._isScrolling=o,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(o){this._isStopped!==o&&(this._isStopped=o,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(o){this._isLocked!==o&&(this._isLocked=o,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let o="lenis";return this.options.autoToggle&&(o+=" lenis-autoToggle"),this.isStopped&&(o+=" lenis-stopped"),this.isLocked&&(o+=" lenis-locked"),this.isScrolling&&(o+=" lenis-scrolling"),this.isScrolling==="smooth"&&(o+=" lenis-smooth"),o}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(o=>{this.rootElement.classList.add(o)})}cleanUpClassName(){for(const o of Array.from(this.rootElement.classList))(o==="lenis"||o.startsWith("lenis-"))&&this.rootElement.classList.remove(o)}};let M=null;class Y{lenis=null;rafId=null;constructor(){this.init(),M=this}init(){try{this.lenis=new V({duration:1.2,easing:i=>Math.min(1,1.001-Math.pow(2,-10*i)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,touchMultiplier:1.8});const t=i=>{this.lenis?.raf(i),this.rafId=requestAnimationFrame(t)};this.rafId=requestAnimationFrame(t)}catch(t){console.warn("Lenis smooth scroll fallback to native scroll",t)}}scrollTo(t,i){this.lenis?.scrollTo(t,i)}stop(){this.lenis?.stop()}start(){this.lenis?.start()}destroy(){this.rafId&&cancelAnimationFrame(this.rafId),this.lenis?.destroy()}}class G{routes=[];mountPoint;transitionEl;isTransitioning=!1;isInitialLoad=!0;constructor(t){this.mountPoint=t;let i=document.querySelector(".page-transition");i||(i=document.createElement("div"),i.className="page-transition",i.innerHTML='<div class="page-transition__panel"></div>',document.body.appendChild(i)),this.transitionEl=i,window.addEventListener("popstate",()=>this.handleCurrentRoute()),document.addEventListener("click",e=>this.handleLinkClicks(e))}register(t,i,e="Agrumêa Farm"){const s=[],a=t.replace(/:([a-zA-Z0-9_]+)/g,(c,l)=>(s.push(l),"([^/]+)")).replace(/\//g,"\\/"),r=new RegExp(`^${a}$`);this.routes.push({pattern:r,paramNames:s,handler:i,title:e})}navigate(t){window.location.pathname!==t&&(window.history.pushState({},"",t),this.handleCurrentRoute())}navigateTo(t){this.navigate(t)}handleLinkClicks(t){const i=t.target.closest("a[href]");if(!i)return;const e=i.getAttribute("href");!e||e.startsWith("http")||e.startsWith("mailto:")||e.startsWith("#")||(t.preventDefault(),this.navigate(e))}async handleCurrentRoute(){if(this.isTransitioning)return;this.isTransitioning=!0;const t=window.location.pathname||"/";let i=null,e={};for(const a of this.routes){const r=t.match(a.pattern);if(r){i=a,a.paramNames.forEach((c,l)=>{e[c]=r[l+1]});break}}if(!i&&this.routes.length>0&&(i=this.routes[0]),!i){this.isTransitioning=!1;return}if(this.isInitialLoad){this.isInitialLoad=!1,document.title=i.title,this.updateActiveNavLink(t),window.scrollTo(0,0),M?.scrollTo(0,{immediate:!0}),this.mountPoint.innerHTML="";const a=await i.handler(e);this.mountPoint.appendChild(a),this.isTransitioning=!1;return}this.transitionEl.classList.add("is-active"),document.title=i.title,this.updateActiveNavLink(t),await new Promise(a=>setTimeout(a,550)),window.scrollTo(0,0),M?.scrollTo(0,{immediate:!0}),this.mountPoint.innerHTML="";const s=await i.handler(e);this.mountPoint.appendChild(s),await new Promise(a=>setTimeout(a,550)),this.transitionEl.classList.remove("is-active"),this.isTransitioning=!1}updateActiveNavLink(t){document.querySelectorAll(".nav-link").forEach(i=>{const e=i.getAttribute("href");e===t||t!=="/"&&e!=="/"&&t.startsWith(e||"")?i.classList.add("active"):i.classList.remove("active")})}}class j{element;dot;pill;text;mouseX=-100;mouseY=-100;currentX=-100;currentY=-100;isVisible=!1;isHovering=!1;isGrabbing=!1;isRunning=!0;constructor(t="customCursor"){let i=document.getElementById(t);i||(i=document.createElement("div"),i.id=t,i.className="custom-cursor",i.innerHTML=`
        <div class="cursor-dot"></div>
        <div class="cursor-pill" id="cursorPill">
          <span class="cursor-diamond"></span>
          <span class="cursor-text" id="cursorText">EXPLORE</span>
        </div>
      `,document.body.appendChild(i)),this.element=i,this.dot=i.querySelector(".cursor-dot"),this.pill=i.querySelector(".cursor-pill"),this.text=i.querySelector(".cursor-text"),this.bindEvents(),this.loop=this.loop.bind(this),requestAnimationFrame(this.loop)}bindEvents(){window.addEventListener("mousemove",t=>{this.mouseX=t.clientX,this.mouseY=t.clientY,this.isVisible||(this.isVisible=!0,this.element.classList.add("is-visible"))}),document.addEventListener("mouseleave",()=>{this.isVisible=!1,this.element.classList.remove("is-visible")}),document.addEventListener("mouseenter",()=>{this.isVisible=!0,this.element.classList.add("is-visible")}),document.addEventListener("mousedown",()=>{this.isGrabbing=!0,this.element.classList.add("is-grabbing")}),document.addEventListener("mouseup",()=>{this.isGrabbing=!1,this.element.classList.remove("is-grabbing")})}setContext(t,i=!0){this.isHovering=i,this.text&&(this.text.textContent=t),i?this.element.classList.add("is-hovering"):this.element.classList.remove("is-hovering")}bindInteractive(t,i){t.forEach(e=>{e.addEventListener("mouseenter",()=>this.setContext(i,!0)),e.addEventListener("mouseleave",()=>this.setContext("EXPLORE",!1))})}loop(){this.isRunning&&(this.currentX+=(this.mouseX-this.currentX)*.22,this.currentY+=(this.mouseY-this.currentY)*.22,this.element.style.transform=`translate3d(${this.currentX}px, ${this.currentY}px, 0)`,requestAnimationFrame(this.loop))}destroy(){this.isRunning=!1}}const w=[{id:"smeraldo",slug:"smeraldo",title:"Sicilian Pistachio Pesto",latinSubtitle:"Pistacia Vera Siculus",category:"savory",price:"€8.50",weight:"210g ℮",origin:"Mount Etna Valley, Sicily",description:"Artisanal savory pesto crafted with 65% select Sicilian pistachios, cold-pressed extra virgin olive oil, and Trapani sea salt.",ingredients:["Sicilian Pistachio (65%)","Extra Virgin Olive Oil","Trapani Sea Salt","Black Pepper"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhgweQX7-eWdJF_Pesto-salato_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhgAeQX7-eWdJC_pesto_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80"},{id:"marmellata_arancia",slug:"marmellata_arancia",title:"Sliced Orange Marmalade",latinSubtitle:"Citrus Sinensis Dulcis",category:"sweet",price:"€6.80",weight:"260g ℮",origin:"Plain of Catania, Sicily",description:"Finely sliced sun-ripened blood and blonde Sicilian oranges slow-cooked with candied rind in copper caldrons.",ingredients:["Sicilian Oranges (70%)","Raw Cane Sugar","Fresh Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvgwQeQX7-eWdIy_arancia_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvg-QeQX7-eWdIz_arancia_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80"},{id:"caponata",slug:"caponata",title:"Traditional Sicilian Caponata",latinSubtitle:"Solanum Melongena Agrodolce",category:"savory",price:"€7.90",weight:"280g ℮",origin:"Floridia, Syracuse, Sicily",description:"Crisp fried eggplants in extra virgin olive oil, Nocellara olives, wild Pantelleria capers, and traditional sweet-and-sour reduction.",ingredients:["Sicilian Eggplants","Tomato Passata","Nocellara Olives","Capers","Apple Cider Vinegar"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhTgeQX7-eWdI0_caponata_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhdAeQX7-eWdI2_caponata_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80"},{id:"pestorosso",slug:"pestorosso",title:"Sun-Dried Tomato & Ricotta Pesto",latinSubtitle:"Lycopersicon Sol Siculo",category:"savory",price:"€6.90",weight:"200g ℮",origin:"Hyblaean Mountains, Ragusa",description:"Sun-drenched Sicilian tomatoes blended with artisanal salted ricotta, fresh sweet basil, and toasted pine nuts.",ingredients:["Sun-Dried Tomato (50%)","Extra Virgin Olive Oil","Salted Ricotta","Toasted Pine Nuts","Wild Oregano"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhfQeQX7-eWdI__pesto-rosso_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhfgeQX7-eWdJA_pesto-rosso_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80"},{id:"fregole_bacche",slug:"fregole_bacche",title:"Wild Strawberry & Goji Preserve",latinSubtitle:"Fragaria Vesca Vulcani",category:"sweet",price:"€7.50",weight:"230g ℮",origin:"Maletto, Mount Etna",description:"Wild Mount Etna forest strawberries paired with goji berries cultivated on mineral-rich volcanic potassium soils.",ingredients:["Etna Strawberries (75%)","Sicilian Goji Berries","Raw Cane Sugar","Fresh Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvheAeQX7-eWdI6_fragole_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhdweQX7-eWdI5_fragola_result.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80"},{id:"smeralda",slug:"smeralda",title:"Sweet Pistachio Cream",latinSubtitle:"Pistacia Dulcis Smeralda",category:"spread",price:"€9.50",weight:"200g ℮",origin:"Bronte, Mount Etna",description:"Velvety sweet green pistachio spread made from 45% pure Bronte PDO pistachio paste and rich cocoa butter.",ingredients:["Bronte Pistachio Paste (45%)","Raw Cane Sugar","Vegetable Oils","Cocoa Butter","Skimmed Milk"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhfweQX7-eWdJB_pesto_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhhAeQX7-eWdJG_pistacchio_result.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=1200&q=80"},{id:"gelsi_neri",slug:"gelsi_neri",title:"Black Mulberry Jam",latinSubtitle:"Morus Nigra Siculus",category:"sweet",price:"€9.20",weight:"220g ℮",origin:"Giarre & Riposto, Sicily",description:"Fresh black mulberries hand-picked at dawn along coastal orchards, celebrated for their deep floral aroma.",ingredients:["Sicilian Black Mulberries (80%)","Raw Cane Sugar","Natural Fruit Pectin","Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhegeQX7-eWdI8_gelsi_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvheQeQX7-eWdI7_gelsi_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=1200&q=80"},{id:"mennulata",slug:"mennulata",title:"Mennulata — Sweet Almond Cream",latinSubtitle:"Prunus Dulcis Avola",category:"spread",price:"€8.90",weight:"200g ℮",origin:"Avola & Noto, Sicily",description:"Pizzuta d'Avola almonds roasted gently on wood fire and stone-ground to a luxurious buttery spread.",ingredients:["Avola Pizzuta Almonds (50%)","Raw Cane Sugar","Extra Virgin Olive Oil","Bourbon Vanilla"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhfAeQX7-eWdI-_mandorla_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvheweQX7-eWdI9_mandorla_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80"},{id:"cipolla",slug:"cipolla",title:"Sweet & Sour Giarratana Onion",latinSubtitle:"Allium Cepa Giarratana",category:"condiment",price:"€6.50",weight:"280g ℮",origin:"Giarratana, Ragusa",description:"Remarkably sweet heirloom Giarratana onions braised slowly with fresh bay leaves, white wine vinegar, and wildflower honey.",ingredients:["Giarratana Onions (70%)","Extra Virgin Olive Oil","White Wine Vinegar","Wildflower Honey","Bay Leaves"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhdQeQX7-eWdI3_cipolla_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhdgeQX7-eWdI4_cipolla-in-agrodolce_result.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80"},{id:"pera_cannella",slug:"pera_cannella",title:"Coscia Pear & Ceylon Cinnamon",latinSubtitle:"Pyrus Communis Cinnamomum",category:"sweet",price:"€7.20",weight:"240g ℮",origin:"Maniace, Mount Etna",description:"Tender sugary Coscia pears from high Etna groves infused with freshly cold-ground Ceylon cinnamon quills.",ingredients:["Etna Coscia Pears (75%)","Raw Cane Sugar","Ceylon Cinnamon (1%)","Lemon Juice"],jarUrl:"https://images.prismic.io/agrumea-site/ahvhgQeQX7-eWdJD_pera_result.webp?auto=format,compress",labelUrl:"https://images.prismic.io/agrumea-site/ahvhggeQX7-eWdJE_pera_result-1.webp?auto=format,compress",sceneUrl:"https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=1200&q=80"}],R=[{id:"touche-keyboard",slug:"touche-keyboard",name:"touche-keyboard",title:"Touché — Custom 3D Mechanical Keyboard",client:"Touché Hardware Lab",year:"2026",category:"3D HARDWARE SHOWCASE",description:"Immersive 3D mechanical keyboard configurator and scroll experience with real-time switch mechanics, tactile keycap customization, and acoustic haptic feedback.",highlights:["Interactive 3D exploded view of keyboard chassis, PCB, plate, and mechanical switches","Real-time sound synthesizer simulating mechanical switch sound profiles (linear, tactile, clicky)","Custom PBR metal, brass weight, and frosted polycarbonate materials"],techStack:["Three.js","TypeScript","WebGL 2.0","GLSL Shaders","Web Audio API"],metrics:"60fps WebGL · Real-time PBR · Spatial Audio",liveUrl:"https://github.com/OCIMoh/touche-keyboard",githubUrl:"https://github.com/OCIMoh/touche-keyboard",previewImageUrl:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",color:"#00d2ff",isLive:!1},{id:"lumina-coffee",slug:"lumina-coffee",name:"lumina-coffee",title:"Lumina Coffee — Scrollytelling Experience",client:"Lumina Artisanal Roasters",year:"2026",category:"3D SCROLLYTELLING",description:"Cinematic vertical scrollytelling journey following single-origin Ethiopian coffee beans from volcanic soil harvesting to copper flame drum roasting.",highlights:["Continuous parallax scroll narrative with synchronized camera dolly sequences","Dynamic flavor profile radar chart and olfactory notes breakdown","Sub-second first contentful paint and responsive mobile storytelling"],techStack:["TypeScript","Canvas API","Scrollytelling","CSS3D","Vite"],metrics:"100 Lighthouse Performance · Butter Scroll",liveUrl:"https://github.com/OCIMoh/lumina-coffee",githubUrl:"https://github.com/OCIMoh/lumina-coffee",previewImageUrl:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",color:"#e58a32",isLive:!1},{id:"koi-fish-3d",slug:"koi-fish-3d",name:"koi-fish-3d",title:"Nishikigoi — Interactive 3D Fluid Simulation",client:"Creative R&D Lab",year:"2026",category:"WEBGL SIMULATION",description:"High-performance interactive 3D Koi fish pond simulation featuring organic boid flocking behavior, procedural fin deformation, and real-time cursor ripple shaders.",highlights:["Procedural skeletal animation mimicking biological fish locomotion","Interactive caustics light projection and water refraction shaders","Spatial food-feeding attraction physics triggered by pointer gestures"],techStack:["Three.js","WebGL","GLSL Vertex Shaders","TypeScript","Math Physics"],metrics:"120fps GPU · Procedural Kinematics",liveUrl:"https://github.com/OCIMoh/koi-fish-3d",githubUrl:"https://github.com/OCIMoh/koi-fish-3d",previewImageUrl:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",color:"#ff3d00",isLive:!1},{id:"universal-college",slug:"universal-college",name:"universal-college",title:"Universal College — Institutional Portal",client:"Universal College Patran",year:"2026",category:"CAMPUS DIGITAL PLATFORM",description:"Modern, high-trust institutional portal for Universal College Patran with interactive academic department directories, admissions pipeline, and virtual campus tours.",highlights:["Comprehensive academic course registry with dynamic qualification filters","Direct online student inquiry and prospect onboarding system","Production-deployed on Vercel with instant edge caching"],techStack:["TypeScript","Next.js","TailwindCSS","Vercel Edge","Responsive UI"],metrics:"Production Live · 500+ Daily Students",liveUrl:"https://universal-college-patran.vercel.app/",githubUrl:"https://github.com/OCIMoh/universal-college",previewImageUrl:"https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",color:"#3b82f6",isLive:!0},{id:"jimmy-oye",slug:"jimmy-oye",name:"jimmy-oye",title:"Jimmy Oye — Creative Portfolio & Audio",client:"Jimmy Oye Music & Media",year:"2026",category:"CREATIVE DEVELOPER PORTFOLIO",description:"High-energy personal creative portfolio with kinetic typography, custom soundboard playback, and micro-interactive cursor physics.",highlights:["Interactive music stem player with frequency visualizer spectrum","Smooth scroll transitions with dynamic color palette morphing","Live deployed on Vercel with automated CI/CD pipeline"],techStack:["TypeScript","React","Framer Motion","Web Audio API","Vercel"],metrics:"Production Live · Audio-Reactive UI",liveUrl:"https://jimmy-oye.vercel.app",githubUrl:"https://github.com/OCIMoh/jimmy-oye",previewImageUrl:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",color:"#a855f7",isLive:!0},{id:"adieu-perfume",slug:"adieu-perfume",name:"adieu-perfume",title:"Adieu Parfums — Haute Parfumerie",client:"Maison Adieu Paris",year:"2026",category:"LUXURY E-COMMERCE",description:"Monastic minimalist luxury digital showcase for artisanal niche fragrances with olfactory scent pyramid breakdowns and bespoke glass bottle presentation.",highlights:["Full-bleed black obsidian aesthetic inspired by high-fashion Parisian ateliers","Olfactory notes navigation: Top, Heart, and Base note accord reveals","Bespoke micro-typography and silky mouse-following ambient lens"],techStack:["CSS Architecture","Vanilla JavaScript","SVG Micro-Interactions","WebGL"],metrics:"Quiet Luxury · Monastic Aesthetics",liveUrl:"https://github.com/OCIMoh/adieu-perfume",githubUrl:"https://github.com/OCIMoh/adieu-perfume",previewImageUrl:"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",color:"#e2d8ce",isLive:!1},{id:"amit-tandon",slug:"amit-tandon",name:"amit-tandon",title:"Amit Tandon — Executive Showcase",client:"Amit Tandon",year:"2026",category:"EXECUTIVE PORTFOLIO",description:"Polished corporate leadership portfolio showcasing public speaking keynotes, advisory ventures, and media broadcast appearances with editorial clarity.",highlights:["High-contrast editorial typography with fluid layout transitions","Curated video gallery of television and podcast keynote appearances","Production-deployed on Vercel with sub-second page delivery"],techStack:["CSS3","Modern JavaScript","Vercel Edge","Responsive Design"],metrics:"Production Live · Executive Grade",liveUrl:"https://amit-tandon.vercel.app",githubUrl:"https://github.com/OCIMoh/amit-tandon",previewImageUrl:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",color:"#f59e0b",isLive:!0},{id:"wraith",slug:"wraith",name:"wraith",title:"Project Wraith — Dark Mode Cyber Suite",client:"Internal Design Lab",year:"2026",category:"CYBERNETIC UI SYSTEM",description:"Experimental dark mode design system and UI framework built for next-generation developer tooling, glowing telemetry consoles, and low-latency workstations.",highlights:["High-contrast darkroom obsidian palette with neon cyan and lime status telemetry","Zero-dependency hardware-accelerated CSS and Canvas component library","Modular dashboard layouts designed for ultra-dense data display"],techStack:["CSS Systems","Custom Canvas Shaders","TypeScript","Hardware Compositing"],metrics:"Sub-millisecond Render · Dark Cyberpunk",liveUrl:"https://github.com/OCIMoh/wraith",githubUrl:"https://github.com/OCIMoh/wraith",previewImageUrl:"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",color:"#10b981",isLive:!1},{id:"amc-journey",slug:"amc-journey",name:"amc-journey",title:"AMC Pet Hospital — Care Journey",client:"Animal Medical Care Mohali",year:"2026",category:"VETERINARY HEALTHCARE",description:"Compassionate, high-trust veterinary hospital web application featuring step-by-step patient care timelines, digital medical appointments, and surgeon credentials.",highlights:["Interactive pet recovery timeline guiding owners through post-op milestones","Emergency 24/7 hotline triage launcher with geographic clinic routing","Accessibility-first typography designed for high-stress medical environments"],techStack:["TypeScript","TailwindCSS","Form Validation API","Responsive UI"],metrics:"WCAG 2.1 AA Compliant · High Trust UI",liveUrl:"https://github.com/OCIMoh/amc-journey",githubUrl:"https://github.com/OCIMoh/amc-journey",previewImageUrl:"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80",color:"#06b6d4",isLive:!1},{id:"boosit-showcase-poc-1",slug:"boosit-showcase-poc-1",name:"boosit-showcase-poc-1",title:"BoostIt — Growth Engine Landing Experience",client:"BoostIt SaaS Inc.",year:"2026",category:"SAAS PRODUCT LAUNCH",description:"Conversion-engineered SaaS marketing experience featuring dynamic ROI projections, animated product feature walkthroughs, and social proof benchmarks.",highlights:["Interactive growth multiplier slider showing expected revenue lift in real time","Clean modular pricing matrix with billing cycle toggles and feature tooltips","Engineered for maximum signup funnel velocity and micro-conversion"],techStack:["HTML5","CSS Grid","JavaScript Kinetic Motion","Responsive"],metrics:"+42% Funnel Velocity · SaaS Benchmark",liveUrl:"https://github.com/OCIMoh/boosit-showcase-poc-1",githubUrl:"https://github.com/OCIMoh/boosit-showcase-poc-1",previewImageUrl:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",color:"#ec4899",isLive:!1},{id:"varun-sir-portfolio",slug:"varun-sir-portfolio",name:"varun-sir-portfolio",title:"Varun Tech Portfolio — Engineering Leadership",client:"Varun Engineering",year:"2026",category:"TECH LEADERSHIP PORTFOLIO",description:"Personal tech portfolio showcasing full-stack engineering architecture, software engineering curriculum design, and mentorship milestones.",highlights:["Interactive skill matrix and engineering stack proficiency indicators","Curriculum repository showcasing real-world full-stack student project codebases","Clean developer dark aesthetics with rapid markdown documentation viewer"],techStack:["TypeScript","Next.js","Markdown Parser","TailwindCSS"],metrics:"Developer Focused · Clean Tech",liveUrl:"https://github.com/OCIMoh/varun-sir-portfolio",githubUrl:"https://github.com/OCIMoh/varun-sir-portfolio",previewImageUrl:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",color:"#6366f1",isLive:!1}];class J{wrapper;track;badge;products;onSelectProduct;onUpdateTelemetry;targetX=0;currentX=0;lerpFactor=.085;itemWidth=220;itemSpacing=40;effectiveItemWidth=260;trackWidth=2600;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetX=0;lastClientX=0;lastTime=0;dragVelocity=0;velocity=0;items=[];isRunning=!0;boundEvents=[];constructor(t){this.wrapper=t.wrapper,this.track=t.track,this.badge=t.badge||null,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.onUpdateTelemetry=t.onUpdateTelemetry;const i=t.inclineAngle!==void 0?t.inclineAngle:10;document.documentElement.style.setProperty("--jar-marquee-angle",`${i}deg`),this.initDOM(),this.updateDimensions(),this.bindEvents(),this.loop=this.loop.bind(this),requestAnimationFrame(this.loop)}initDOM(){this.track.innerHTML="",this.items=[],this.products.forEach((t,i)=>{const e=document.createElement("a");e.className="jar-slider__item",e.href=`/dispensa/${t.slug}`,e.setAttribute("aria-label",t.title),e.dataset.index=i.toString(),e.dataset.id=t.id,e.innerHTML=`
        <img class="jar-slider__base" src="${t.jarUrl}" alt="${t.title}" loading="eager" />
        <canvas class="jar-slider__label" width="300" height="180" aria-hidden="true"></canvas>
      `,this.track.appendChild(e);const s=e.querySelector(".jar-slider__label");if(!s)return;const a=s.getContext("2d");if(!a)return;const r={element:e,canvas:s,ctx:a,product:t,index:i,labelLoaded:!1};if(t.labelUrl){const c=new Image;c.crossOrigin="anonymous",c.src=t.labelUrl,c.onload=()=>{r.labelLoaded=!0,r.labelImg=c,this.renderCylindricalLabel(r,this.currentX)}}this.items.push(r),this.renderCylindricalLabel(r,0)})}updateDimensions(){const t=this.items[0]?.element;t&&t.offsetWidth>0?this.itemWidth=t.offsetWidth:this.itemWidth=window.innerWidth<=768?160:200,this.itemSpacing=Math.max(30,Math.round(window.innerWidth*.035)),this.effectiveItemWidth=this.itemWidth+this.itemSpacing,this.trackWidth=this.products.length*this.effectiveItemWidth}renderCylindricalLabel(t,i){const e=t.ctx,s=t.canvas.width,a=t.canvas.height,r=t.product;e.clearRect(0,0,s,a);const c=Math.sin(i*.0025+t.index*.6)*16;if(t.labelLoaded&&t.labelImg){e.save(),e.drawImage(t.labelImg,c,0,s,a);const l=e.createLinearGradient(0,0,s,0);l.addColorStop(0,"rgba(0, 0, 0, 0.42)"),l.addColorStop(.18,"rgba(0, 0, 0, 0.08)"),l.addColorStop(.5,"rgba(255, 255, 255, 0.25)"),l.addColorStop(.82,"rgba(0, 0, 0, 0.08)"),l.addColorStop(1,"rgba(0, 0, 0, 0.45)"),e.fillStyle=l,e.fillRect(0,0,s,a),e.restore()}else{e.save();const l=r.category==="sweet"?"#d44213":r.category==="spread"?"#4a5d23":"#762530";e.fillStyle=l,e.beginPath(),e.roundRect(0,0,s,a,6),e.fill(),e.strokeStyle="#e6c89f",e.lineWidth=2.5,e.strokeRect(6,6,s-12,a-12),e.textAlign="center",e.fillStyle="#fdf3eb",e.font='600 10px "Plus Jakarta Sans", sans-serif',e.fillText("AGRUMÊA FARM • SICILY",s/2+c*.5,36),e.font='700 15px "Cinzel", serif',e.fillText(r.title,s/2+c,72),e.font='italic 11px "Plus Jakarta Sans", sans-serif',e.fillText(r.latinSubtitle,s/2+c*.8,102),e.font='600 10px "Plus Jakarta Sans", sans-serif',e.fillText(`${r.weight} • ${r.origin.split(",")[0]}`,s/2+c*.5,142);const n=e.createLinearGradient(0,0,s,0);n.addColorStop(0,"rgba(0, 0, 0, 0.42)"),n.addColorStop(.2,"rgba(0, 0, 0, 0.05)"),n.addColorStop(.5,"rgba(255, 255, 255, 0.22)"),n.addColorStop(.8,"rgba(0, 0, 0, 0.05)"),n.addColorStop(1,"rgba(0, 0, 0, 0.45)"),e.fillStyle=n,e.fillRect(0,0,s,a),e.restore()}}addTrackedListener(t,i,e,s){t.addEventListener(i,e,s),this.boundEvents.push({target:t,type:i,handler:e})}bindEvents(){const t=a=>{if(document.body.classList.contains("is-nav-open"))return;this.isDragging=!0,this.hasDragged=!1;const r="touches"in a?a.touches[0].clientX:a.clientX,c="touches"in a?a.touches[0].clientY:a.clientY;this.startClientX=r,this.startClientY=c,this.startTargetX=this.targetX,this.lastClientX=r,this.lastTime=performance.now(),this.dragVelocity=0,document.body.classList.add("grabbing")},i=a=>{if(!this.isDragging||document.body.classList.contains("is-nav-open"))return;const r="touches"in a?a.touches[0].clientX:a.clientX,c="touches"in a?a.touches[0].clientY:a.clientY;Math.hypot(r-this.startClientX,c-this.startClientY)>8&&(this.hasDragged=!0);const n=r-this.startClientX;this.targetX=this.startTargetX+n*1.35;const p=performance.now(),h=Math.max(p-this.lastTime,12);this.dragVelocity=(r-this.lastClientX)/h,this.lastClientX=r,this.lastTime=p},e=()=>{this.isDragging&&(this.isDragging=!1,document.body.classList.remove("grabbing"),Math.abs(this.dragVelocity)>.1&&(this.targetX+=this.dragVelocity*200))};this.addTrackedListener(this.wrapper,"mousedown",t),this.addTrackedListener(window,"mousemove",i),this.addTrackedListener(window,"mouseup",e),this.addTrackedListener(this.wrapper,"touchstart",t,{passive:!0}),this.addTrackedListener(window,"touchmove",i,{passive:!0}),this.addTrackedListener(window,"touchend",e),this.addTrackedListener(this.wrapper,"wheel",(a=>{if(document.body.classList.contains("is-nav-open"))return;a.preventDefault();const r=Math.abs(a.deltaX)>Math.abs(a.deltaY)?a.deltaX:a.deltaY;this.targetX-=r*1.5}),{passive:!1});let s;this.addTrackedListener(window,"resize",()=>{clearTimeout(s),s=window.setTimeout(()=>this.updateDimensions(),100)}),this.items.forEach(a=>{this.addTrackedListener(a.element,"click",(r=>{if(this.hasDragged||Math.abs(this.velocity)>.8){r.preventDefault(),r.stopPropagation();return}this.onSelectProduct&&(r.preventDefault(),this.onSelectProduct(a.product))}))})}loop(){if(!this.isRunning)return;const t=this.currentX;this.currentX+=(this.targetX-this.currentX)*this.lerpFactor,this.velocity=this.currentX-t;const i=window.innerWidth/2,e=Math.abs(this.velocity)>.005;this.items.forEach(a=>{let c=((this.currentX+a.index*this.effectiveItemWidth)%this.trackWidth+this.trackWidth)%this.trackWidth;c-=this.trackWidth/2-i;const l=Math.abs(c-i),n=Math.min(l/(window.innerWidth*.7),1),p=1-n*.12,h=1-Math.pow(n,3)*.6;a.element.style.transform=`translate3d(${c}px, 0, 0) scale(${p})`,a.element.style.opacity=h.toString(),e&&this.renderCylindricalLabel(a,this.currentX)});const s=this.currentX*-.06%360;document.documentElement.style.setProperty("--jar-circle-rotation",`${s}deg`),this.onUpdateTelemetry&&this.onUpdateTelemetry({velocity:Math.abs(this.velocity),rotation:s}),requestAnimationFrame(this.loop)}destroy(){this.isRunning=!1,this.boundEvents.forEach(({target:t,type:i,handler:e})=>{t.removeEventListener(i,e)}),this.boundEvents=[]}}class Z{container;products;onSelectProduct;wrapper;canvas;gl=null;program=null;trackEl;cardElements=[];targetX=0;currentX=0;velocity=0;lerpFactor=.085;startTime=performance.now();cardWidth=280;cardSpacing=44;effectiveWidth;trackWidth;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetX=0;lastClientX=0;lastTime=0;dragVelocity=0;uTimeLoc=null;uVelocityLoc=null;uResolutionLoc=null;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.effectiveWidth=this.cardWidth+this.cardSpacing,this.trackWidth=this.products.length*this.effectiveWidth,this.buildDOM(),this.initWebGL(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="liquid-carousel",this.wrapper.style.cssText=`
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
    `,s=t.createShader(t.VERTEX_SHADER);t.shaderSource(s,i),t.compileShader(s);const a=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(a,e),t.compileShader(a);const r=t.createProgram();if(t.attachShader(r,s),t.attachShader(r,a),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS)){console.warn("GLSL failed to link:",t.getProgramInfoLog(r));return}this.program=r,t.useProgram(r);const c=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,c),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);const l=t.getAttribLocation(r,"a_position");t.enableVertexAttribArray(l),t.vertexAttribPointer(l,2,t.FLOAT,!1,0,0),this.uTimeLoc=t.getUniformLocation(r,"u_time"),this.uVelocityLoc=t.getUniformLocation(r,"u_velocity"),this.uResolutionLoc=t.getUniformLocation(r,"u_resolution"),this.resizeCanvas()}resizeCanvas(){if(!this.canvas||!this.gl)return;const t=Math.min(window.devicePixelRatio||1,2),i=this.wrapper.clientWidth||window.innerWidth,e=this.wrapper.clientHeight||window.innerHeight;this.canvas.width=i*t,this.canvas.height=e*t,this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}bindEvents(){const t=s=>{if(document.body.classList.contains("is-nav-open"))return;this.isDragging=!0,this.hasDragged=!1;const a="touches"in s?s.touches[0].clientX:s.clientX,r="touches"in s?s.touches[0].clientY:s.clientY;this.startClientX=a,this.startClientY=r,this.startTargetX=this.targetX,this.lastClientX=a,this.lastTime=performance.now(),this.dragVelocity=0,this.trackEl.style.cursor="grabbing"},i=s=>{if(!this.isDragging)return;const a="touches"in s?s.touches[0].clientX:s.clientX,r="touches"in s?s.touches[0].clientY:s.clientY;Math.hypot(a-this.startClientX,r-this.startClientY)>8&&(this.hasDragged=!0);const l=a-this.startClientX;this.targetX=this.startTargetX+l*1.35;const n=performance.now(),p=Math.max(n-this.lastTime,12);this.dragVelocity=(a-this.lastClientX)/p,this.lastClientX=a,this.lastTime=n},e=()=>{this.isDragging&&(this.isDragging=!1,this.trackEl.style.cursor="grab",Math.abs(this.dragVelocity)>.1&&(this.targetX+=this.dragVelocity*220))};this.addTrackedListener(this.trackEl,"mousedown",t),this.addTrackedListener(window,"mousemove",i),this.addTrackedListener(window,"mouseup",e),this.addTrackedListener(this.trackEl,"touchstart",t,{passive:!0}),this.addTrackedListener(window,"touchmove",i,{passive:!0}),this.addTrackedListener(window,"touchend",e),this.addTrackedListener(this.trackEl,"wheel",(s=>{s.preventDefault();const a=Math.abs(s.deltaX)>Math.abs(s.deltaY)?s.deltaX:s.deltaY;this.targetX-=a*1.5}),{passive:!1}),this.addTrackedListener(window,"resize",()=>this.resizeCanvas()),this.cardElements.forEach((s,a)=>{this.addTrackedListener(s,"click",r=>{this.hasDragged||Math.abs(this.velocity)>.8||this.onSelectProduct&&(r.preventDefault(),this.onSelectProduct(this.products[a]))})})}addTrackedListener(t,i,e,s){t.addEventListener(i,e,s),this.boundEvents.push({target:t,type:i,handler:e})}loop(){if(!this.isRunning)return;const t=this.currentX;if(this.currentX+=(this.targetX-this.currentX)*this.lerpFactor,this.velocity=this.currentX-t,this.gl&&this.program){const a=this.gl;a.useProgram(this.program);const r=(performance.now()-this.startTime)*.001;this.uTimeLoc&&a.uniform1f(this.uTimeLoc,r),this.uVelocityLoc&&a.uniform1f(this.uVelocityLoc,this.velocity),this.uResolutionLoc&&a.uniform2f(this.uResolutionLoc,this.canvas.width,this.canvas.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.drawArrays(a.TRIANGLES,0,6)}const i=window.innerWidth/2,e=Math.max(-12,Math.min(12,this.velocity)),s=e*1.8;this.cardElements.forEach((a,r)=>{let l=((this.currentX+r*this.effectiveWidth)%this.trackWidth+this.trackWidth)%this.trackWidth;l-=this.trackWidth/2-i;const n=Math.abs(l-i),p=Math.min(n/(window.innerWidth*.7),1),h=1-p*.12,d=1-Math.pow(p,3)*.65,u=Math.sin(l*.0035+performance.now()*.002)*16+Math.abs(e)*2.5,m=e*-.9,g=(l-i)*.015;a.style.transform=`translate3d(${l}px, ${u}px, 0) scale(${h}) skewX(${m}deg) rotate(${g}deg)`,a.style.opacity=d.toString(),Math.abs(e)>.4?a.style.boxShadow=`
          ${s}px 0 18px rgba(233, 78, 27, 0.45),
          ${-s}px 0 18px rgba(0, 180, 216, 0.35),
          0 20px 45px rgba(38, 22, 18, 0.15)
        `:a.style.boxShadow="0 20px 45px rgba(38, 22, 18, 0.12), 0 2px 8px rgba(38, 22, 18, 0.06)"}),this.animationFrameId=requestAnimationFrame(this.loop)}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),this.boundEvents.forEach(({target:t,type:i,handler:e})=>{t.removeEventListener(i,e)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentNode&&this.wrapper.parentNode.removeChild(this.wrapper)}}class Q{container;products;onSelectProduct;wrapper;cardStack;cardElements=[];currentIndex=0;isDragging=!1;hasDragged=!1;startX=0;startY=0;currentX=0;currentY=0;lastX=0;lastTime=0;velocityX=0;counterEl;prevBtn;nextBtn;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.buildDOM(),this.renderStack(),this.bindEvents()}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="deck-carousel",this.wrapper.innerHTML=`
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
      `,this.cardStack.appendChild(e),e})}renderStack(t=!1){const i=this.products.length;this.counterEl.textContent=`${String(this.currentIndex+1).padStart(2,"0")} / ${String(i).padStart(2,"0")}`,this.cardElements.forEach((e,s)=>{const a=(s-this.currentIndex+i)%i;e.style.transition=t?"transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease":"none",a===0?(e.style.transform="translate3d(0, 0, 0) scale(1) rotate(0deg)",e.style.opacity="1",e.style.zIndex="10",e.style.pointerEvents="auto",e.classList.add("is-active")):a===1?(e.style.transform="translate3d(0, 22px, -40px) scale(0.95)",e.style.opacity="0.9",e.style.zIndex="9",e.style.pointerEvents="none",e.classList.remove("is-active")):a===2?(e.style.transform="translate3d(0, 44px, -80px) scale(0.90)",e.style.opacity="0.65",e.style.zIndex="8",e.style.pointerEvents="none",e.classList.remove("is-active")):a===3?(e.style.transform="translate3d(0, 66px, -120px) scale(0.85)",e.style.opacity="0.35",e.style.zIndex="7",e.style.pointerEvents="none",e.classList.remove("is-active")):(e.style.transform="translate3d(0, 80px, -160px) scale(0.80)",e.style.opacity="0",e.style.zIndex="1",e.style.pointerEvents="none",e.classList.remove("is-active"))})}bindEvents(){const t=()=>this.cardElements[this.currentIndex],i=a=>{const r=t();if(!r)return;this.isDragging=!0,this.hasDragged=!1;const c="touches"in a?a.touches[0].clientX:a.clientX,l="touches"in a?a.touches[0].clientY:a.clientY;this.startX=c,this.startY=l,this.currentX=0,this.currentY=0,this.lastX=c,this.lastTime=performance.now(),this.velocityX=0,r.style.transition="none",r.style.cursor="grabbing"},e=a=>{if(!this.isDragging)return;const r="touches"in a?a.touches[0].clientX:a.clientX,c="touches"in a?a.touches[0].clientY:a.clientY;this.currentX=r-this.startX,this.currentY=c-this.startY,Math.hypot(this.currentX,this.currentY)>8&&(this.hasDragged=!0);const l=performance.now(),n=Math.max(l-this.lastTime,12);this.velocityX=(r-this.lastX)/n,this.lastX=r,this.lastTime=l;const p=t();if(p){const u=this.currentX*.08;p.style.transform=`translate3d(${this.currentX}px, ${this.currentY}px, 0) rotate(${u}deg) scale(1.02)`}const h=Math.min(Math.abs(this.currentX)/220,1),d=this.cardElements[(this.currentIndex+1)%this.products.length];if(d){const u=.95+h*.05,m=22-h*22;d.style.transform=`translate3d(0, ${m}px, -40px) scale(${u})`}},s=()=>{if(!this.isDragging)return;this.isDragging=!1;const a=t();if(!a)return;if(a.style.cursor="grab",Math.abs(this.currentX)>110||Math.abs(this.velocityX)>.4){const c=this.currentX>=0?1:-1,l=c*(window.innerWidth*.85);a.style.transition="transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.35s ease",a.style.transform=`translate3d(${l}px, ${this.currentY*1.5}px, 50px) rotate(${c*28}deg)`,a.style.opacity="0",setTimeout(()=>{this.currentIndex=(this.currentIndex+1)%this.products.length,this.renderStack(!0)},220)}else{a.style.transition="transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",a.style.transform="translate3d(0, 0, 0) scale(1) rotate(0deg)";const c=this.cardElements[(this.currentIndex+1)%this.products.length];c&&(c.style.transition="transform 0.45s ease",c.style.transform="translate3d(0, 22px, -40px) scale(0.95)")}};this.addTrackedListener(this.cardStack,"mousedown",i),this.addTrackedListener(window,"mousemove",e),this.addTrackedListener(window,"mouseup",s),this.addTrackedListener(this.cardStack,"touchstart",i,{passive:!0}),this.addTrackedListener(window,"touchmove",e,{passive:!0}),this.addTrackedListener(window,"touchend",s),this.addTrackedListener(this.nextBtn,"click",()=>{this.throwCurrentCard(1)}),this.addTrackedListener(this.prevBtn,"click",()=>{this.throwCurrentCard(-1)}),this.cardElements.forEach((a,r)=>{this.addTrackedListener(a,"click",c=>{this.hasDragged||r===this.currentIndex&&this.onSelectProduct&&(c.preventDefault(),this.onSelectProduct(this.products[r]))})})}throwCurrentCard(t){const i=this.cardElements[this.currentIndex];i&&(i.style.transition="transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.35s ease",i.style.transform=`translate3d(${t*650}px, -40px, 50px) rotate(${t*22}deg)`,i.style.opacity="0",setTimeout(()=>{const e=this.products.length;this.currentIndex=t>0?(this.currentIndex+1)%e:(this.currentIndex-1+e)%e,this.renderStack(!0)},200))}addTrackedListener(t,i,e,s){t.addEventListener(i,e,s),this.boundEvents.push({target:t,type:i,handler:e})}destroy(){this.boundEvents.forEach(({target:t,type:i,handler:e})=>{t.removeEventListener(i,e)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentNode&&this.wrapper.parentNode.removeChild(this.wrapper)}}class K{container;wrapper;canvas;ctx=null;streamViewport;streamTrack;gridViewport;hudCounter;hudCoords;soundToggleBtn;viewToggleBtn;progressBar;drawerElement;activeTitleDisplay;activeClientDisplay;projects;numItems;cardElements=[];onSelectProject;viewMode="stream";scrollPos=0;targetScrollPos=0;velocity=0;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startScrollPos=0;lastClientX=0;lastDragTime=0;dragVelocity=0;mouseX=0;mouseY=0;targetMouseX=0;targetMouseY=0;mouseTrail=[];particles=[];numParticles=80;soundEnabled=!1;audioCtx=null;activeDrawerProject=null;lastActiveIndex=0;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.projects=t.projects&&t.projects.length?t.projects:R,this.onSelectProject=t.onSelectProject,this.numItems=this.projects.length,this.buildDOM(),this.initCanvas(),this.initParticles(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}initAudio(){if(!this.audioCtx)try{const t=window.AudioContext||window.webkitAudioContext;this.audioCtx=new t}catch{}}playTone(t=440,i="sine",e=.05,s=.06){if(this.soundEnabled&&(this.initAudio(),!!this.audioCtx))try{this.audioCtx.state==="suspended"&&this.audioCtx.resume();const a=this.audioCtx.createOscillator(),r=this.audioCtx.createGain();a.type=i,a.frequency.setValueAtTime(t,this.audioCtx.currentTime),a.frequency.exponentialRampToValueAtTime(Math.max(40,t*.4),this.audioCtx.currentTime+e),r.gain.setValueAtTime(s,this.audioCtx.currentTime),r.gain.exponentialRampToValueAtTime(1e-4,this.audioCtx.currentTime+e),a.connect(r),r.connect(this.audioCtx.destination),a.start(),a.stop(this.audioCtx.currentTime+e)}catch{}}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="at-showcase at-showcase--stream",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Active Theory 3D Portfolio Showcase"),this.wrapper.innerHTML=`
      <!-- WebGL Fluid Cursor Ribbon & Holographic Depth Corridor Canvas -->
      <canvas class="at-canvas" id="atCanvas" aria-hidden="true"></canvas>

      <!-- Active Theory Cybernetic Telemetry Masthead -->
      <header class="at-masthead" aria-label="Portfolio Telemetry Navigation">
        <div class="at-masthead__brand">
          <span class="at-masthead__dot"></span>
          <span class="at-masthead__logo-text">ACTIVE THEORY</span>
          <span class="at-masthead__sep">//</span>
          <span class="at-masthead__org">OCIMOH STUDIO</span>
        </div>

        <div class="at-masthead__center at-telemetry-badge">
          <span class="at-telemetry-label">TELEMETRY:</span>
          <span class="at-telemetry-val" id="atCoordsText">60.0 FPS // HYDRA 3D MATRIX // VENICE BEACH • AMSTERDAM</span>
        </div>

        <div class="at-masthead__controls">
          <!-- View Toggle: Stream vs Grid -->
          <button class="at-ctrl-pill at-ctrl-pill--toggle" id="atViewToggle" type="button" aria-label="Toggle between 3D Stream and Archive Grid">
            <span class="at-ctrl-icon" id="atViewIcon">⊞</span>
            <span id="atViewLabel">ARCHIVE GRID</span>
          </button>

          <!-- Acoustic Sound Synthesizer Toggle -->
          <button class="at-ctrl-pill at-ctrl-pill--sound" id="atSoundToggle" type="button" aria-label="Toggle Acoustic Sound Effects">
            <span class="at-sound-eq" id="atSoundEq" aria-hidden="true">
              <span class="at-eq-bar"></span>
              <span class="at-eq-bar"></span>
              <span class="at-eq-bar"></span>
            </span>
            <span id="atSoundLabel">SOUND OFF</span>
          </button>

          <!-- Current Index -->
          <div class="at-ctrl-pill at-ctrl-pill--counter">
            <span class="at-counter-label">PROJECT</span>
            <span class="at-counter-val" id="atCounter">01 / ${String(this.numItems).padStart(2,"0")}</span>
          </div>
        </div>
      </header>

      <!-- VIEW 1: 3D Horizontal Spatial Cinema Stream (Active Theory Signature) -->
      <main class="at-stream-viewport" id="atStreamViewport">
        <div class="at-stream-track" id="atStreamTrack">
          <!-- Panoramic Cinema Monolith cards injected dynamically -->
        </div>
      </main>

      <!-- VIEW 2: Architectural 12-Column Case Study Grid (Toggleable Archive) -->
      <section class="at-grid-viewport" id="atGridViewport" aria-label="Archive Grid" style="display: none;">
        <div class="at-grid-inner">
          <div class="at-grid-header">
            <h2 class="at-grid-headline">COMPLETE REPOSITORY ARCHIVE</h2>
            <p class="at-grid-subline">OCIMOH / 11 PRODUCTION EXPERIENCES & 3D PROTOCOLS</p>
          </div>
          <div class="at-grid-cards" id="atGridCards">
            <!-- Grid cards injected dynamically -->
          </div>
        </div>
      </section>

      <!-- Bottom HUD & Navigation Controls -->
      <footer class="at-hud-bottom" id="atBottomControls">
        <!-- Active Project Headline Bar -->
        <div class="at-active-project-bar">
          <div class="at-active-client" id="atActiveClient">OCIMOH STUDIO</div>
          <h1 class="at-active-title" id="atActiveTitle">${this.projects[0].title}</h1>
        </div>

        <!-- Interactive Scrubber & Directional Navigation -->
        <div class="at-scrub-controls">
          <button class="at-nav-btn at-nav-btn--prev" id="atPrevBtn" aria-label="Previous Project (Arrow Left)" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>PREV</span>
          </button>
          
          <div class="at-scrub-rail" id="atScrubRail" role="slider" aria-label="Timeline Depth Scrubber" aria-valuemin="1" aria-valuemax="${this.numItems}" aria-valuenow="1" tabindex="0">
            <div class="at-scrub-track">
              ${this.projects.map((t,i)=>`<span class="at-scrub-dot ${i===0?"is-active":""}" data-index="${i}"></span>`).join("")}
            </div>
            <div class="at-scrub-thumb" id="atProgressBar"></div>
          </div>

          <button class="at-nav-btn at-nav-btn--next" id="atNextBtn" aria-label="Next Project (Arrow Right)" type="button">
            <span>NEXT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div class="at-hud-footer-hint" aria-hidden="true">
          <span>DRAG / ARROWS TO EXPLORE</span>
          <span class="at-bullet">✦</span>
          <span>CLICK MONOLITH TO OPEN CASE STUDY</span>
        </div>
      </footer>

      <!-- In-Situ Full-Bleed Case Study Slide-over Drawer -->
      <aside class="at-drawer" id="atDrawer" aria-label="Project Case Study" aria-hidden="true">
        <div class="at-drawer__backdrop" id="atDrawerBackdrop"></div>
        <div class="at-drawer__panel" id="atDrawerPanel">
          <!-- Injected dynamically via openCaseStudy() -->
        </div>
      </aside>
    `,this.container.appendChild(this.wrapper),this.canvas=this.wrapper.querySelector("#atCanvas"),this.streamViewport=this.wrapper.querySelector("#atStreamViewport"),this.streamTrack=this.wrapper.querySelector("#atStreamTrack"),this.gridViewport=this.wrapper.querySelector("#atGridViewport"),this.hudCounter=this.wrapper.querySelector("#atCounter"),this.hudCoords=this.wrapper.querySelector("#atCoordsText"),this.progressBar=this.wrapper.querySelector("#atProgressBar"),this.drawerElement=this.wrapper.querySelector("#atDrawer"),this.soundToggleBtn=this.wrapper.querySelector("#atSoundToggle"),this.viewToggleBtn=this.wrapper.querySelector("#atViewToggle"),this.activeTitleDisplay=this.wrapper.querySelector("#atActiveTitle"),this.activeClientDisplay=this.wrapper.querySelector("#atActiveClient"),this.buildStreamCards(),this.buildGridCards(),this.soundToggleBtn.addEventListener("click",t=>{t.stopPropagation(),this.soundEnabled=!this.soundEnabled;const i=this.soundToggleBtn.querySelector("#atSoundLabel"),e=this.soundToggleBtn.querySelector("#atSoundEq");this.soundEnabled?(i&&(i.textContent="SOUND ON"),e&&e.classList.add("is-animating"),this.soundToggleBtn.classList.add("is-active"),this.playTone(880,"sine",.08,.1)):(i&&(i.textContent="SOUND OFF"),e&&e.classList.remove("is-animating"),this.soundToggleBtn.classList.remove("is-active"))}),this.viewToggleBtn.addEventListener("click",t=>{t.stopPropagation(),this.toggleViewMode()})}buildStreamCards(){this.cardElements=[],this.streamTrack.innerHTML="",this.projects.forEach((t,i)=>{const e=document.createElement("article");e.className="at-stream-card",e.dataset.index=String(i),e.dataset.slug=t.slug,e.style.setProperty("--proj-accent",t.color),e.style.setProperty("--proj-accent-glow",`${t.color}44`);const s=String(i+1).padStart(2,"0");e.innerHTML=`
        <div class="at-card-chassis">
          <!-- Cyber Monolith Reticle Corner Accents -->
          <span class="at-reticle at-reticle--tl"></span>
          <span class="at-reticle at-reticle--tr"></span>
          <span class="at-reticle at-reticle--bl"></span>
          <span class="at-reticle at-reticle--br"></span>

          <!-- Top Cyber Status Bar -->
          <div class="at-card-top-bar">
            <div class="at-card-id-block">
              <span class="at-card-index">${s}</span>
              <span class="at-card-slash">//</span>
              <span class="at-card-repo-name">${t.name}</span>
            </div>
            <div class="at-card-status-badge ${t.isLive?"is-live":""}">
              <span class="at-status-dot"></span>
              <span>${t.isLive?"LIVE":"GITHUB"}</span>
            </div>
          </div>

          <!-- Panoramic High-Res Viewport Screen Stage -->
          <div class="at-screen-stage">
            <div class="at-screen-glow" style="background: radial-gradient(circle, ${t.color}33 0%, transparent 70%);"></div>
            <img 
              class="at-screen-img" 
              src="${t.previewImageUrl}" 
              alt="${t.title}" 
              loading="${i<3?"eager":"lazy"}" 
              decoding="async" 
              draggable="false" 
            />
            <div class="at-screen-scanlines"></div>
            
            <!-- Tech Stack Pills on Bottom Edge of Viewport -->
            <div class="at-screen-tech-bar">
              ${t.techStack.slice(0,3).map(a=>`<span class="at-tech-pill">${a}</span>`).join("")}
            </div>
          </div>

          <!-- Monolith Footer Details -->
          <div class="at-card-bottom-bar">
            <div class="at-card-meta-block">
              <div class="at-card-client-tag">${t.client} · ${t.year}</div>
              <h3 class="at-card-title">${t.title}</h3>
            </div>
            <button class="at-card-explore-btn" type="button" aria-label="Open Case Study for ${t.title}">
              <span>CASE STUDY</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </button>
          </div>
        </div>
      `,e.addEventListener("click",a=>{if(this.hasDragged){a.preventDefault();return}const r=this.getActiveIndex();i===r?this.openCaseStudy(t):(this.snapToIndex(i),this.playTone(580,"sine",.05,.08))}),this.streamTrack.appendChild(e),this.cardElements.push(e)})}buildGridCards(){const t=this.wrapper.querySelector("#atGridCards");t&&(t.innerHTML="",this.projects.forEach((i,e)=>{const s=document.createElement("div");s.className="at-grid-tile",s.style.setProperty("--proj-accent",i.color),s.innerHTML=`
        <div class="at-grid-tile__image-wrap">
          <img src="${i.previewImageUrl}" alt="${i.title}" class="at-grid-tile__img" loading="lazy" />
          <div class="at-grid-tile__overlay">
            <span class="at-grid-tile__badge ${i.isLive?"is-live":""}">${i.isLive?"● LIVE":"GITHUB"}</span>
          </div>
        </div>
        <div class="at-grid-tile__content">
          <div class="at-grid-tile__meta">
            <span class="at-grid-tile__idx">${String(e+1).padStart(2,"0")}</span>
            <span class="at-grid-tile__client">${i.client}</span>
          </div>
          <h3 class="at-grid-tile__title">${i.title}</h3>
          <p class="at-grid-tile__desc">${i.description}</p>
          <div class="at-grid-tile__tech">
            ${i.techStack.slice(0,4).map(a=>`<span>${a}</span>`).join("")}
          </div>
          <button class="at-grid-tile__btn" type="button">
            <span>VIEW CASE FILE</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      `,s.addEventListener("click",()=>{this.openCaseStudy(i)}),t.appendChild(s)}))}toggleViewMode(){const t=this.wrapper.querySelector("#atViewLabel"),i=this.wrapper.querySelector("#atViewIcon"),e=this.wrapper.querySelector("#atBottomControls");this.viewMode==="stream"?(this.viewMode="grid",this.wrapper.classList.remove("at-showcase--stream"),this.wrapper.classList.add("at-showcase--grid"),this.streamViewport.style.display="none",this.gridViewport.style.display="block",e&&(e.style.display="none"),t&&(t.textContent="3D STREAM"),i&&(i.textContent="⟁"),this.playTone(720,"triangle",.07,.08)):(this.viewMode="stream",this.wrapper.classList.remove("at-showcase--grid"),this.wrapper.classList.add("at-showcase--stream"),this.streamViewport.style.display="block",this.gridViewport.style.display="none",e&&(e.style.display="flex"),t&&(t.textContent="ARCHIVE GRID"),i&&(i.textContent="⊞"),this.playTone(540,"sine",.07,.08))}initCanvas(){this.ctx=this.canvas.getContext("2d",{alpha:!0}),this.resizeCanvas()}resizeCanvas(){if(!this.canvas)return;const t=Math.min(window.devicePixelRatio||1,2),i=this.wrapper.getBoundingClientRect(),e=i.width||window.innerWidth,s=i.height||window.innerHeight;this.canvas.width=e*t,this.canvas.height=s*t,this.canvas.style.width=`${e}px`,this.canvas.style.height=`${s}px`,this.ctx&&(this.ctx.setTransform(1,0,0,1,0,0),this.ctx.scale(t,t))}initParticles(){this.particles=[];const t=window.innerWidth,i=window.innerHeight;for(let e=0;e<this.numParticles;e++)this.particles.push({x:(Math.random()-.5)*t*1.6,y:(Math.random()-.5)*i*1.6,z:Math.random()*1e3+40,size:Math.random()*2+1,speedZ:Math.random()*1.2+.3,alpha:Math.random()*.7+.2})}bindEvents(){const t=(h,d,u,m)=>{h.addEventListener(d,u,m),this.boundEvents.push({target:h,type:d,handler:u,options:m})},i=h=>{if(!h.target.closest("button, a, .at-drawer, .at-scrub-rail, .at-ctrl-pill")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=h.clientX,this.startClientY=h.clientY,this.lastClientX=h.clientX,this.startScrollPos=this.targetScrollPos,this.lastDragTime=performance.now(),this.dragVelocity=0;try{h.target.setPointerCapture(h.pointerId)}catch{}}},e=h=>{const d=this.wrapper.getBoundingClientRect(),u=(h.clientX-d.left)/d.width-.5,m=(h.clientY-d.top)/d.height-.5;this.targetMouseX=u*2,this.targetMouseY=m*2;const g=this.projects[this.getActiveIndex()],v=g?g.color:"#00d2ff",f=performance.now(),b=h.clientX-this.lastClientX;if(this.mouseTrail.push({x:h.clientX,y:h.clientY,time:f,vx:b,vy:0,color:v}),!this.isDragging)return;const y=h.clientX-this.startClientX,S=h.clientY-this.startClientY;!this.hasDragged&&(Math.abs(y)>6||Math.abs(S)>6)&&(this.hasDragged=!0);const x=Math.min(window.innerWidth*.6,750),C=-y/x;this.targetScrollPos=this.startScrollPos+C,Math.max(1,f-this.lastDragTime);const T=h.clientX-this.lastClientX;this.dragVelocity=-T/x*16.67,this.lastClientX=h.clientX,this.lastDragTime=f},s=h=>{if(this.isDragging){this.isDragging=!1;try{h.target.releasePointerCapture(h.pointerId)}catch{}Math.abs(this.dragVelocity)>.05&&(this.targetScrollPos+=this.dragVelocity*4.5),this.targetScrollPos=Math.round(this.targetScrollPos)}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=h=>{if(this.viewMode==="grid"||this.activeDrawerProject)return;h.preventDefault();const d=Math.abs(h.deltaX)>Math.abs(h.deltaY)?h.deltaX:h.deltaY,u=.0016;this.targetScrollPos+=d*u};t(this.wrapper,"wheel",a,{passive:!1});const r=this.wrapper.querySelector("#atPrevBtn"),c=this.wrapper.querySelector("#atNextBtn");r&&t(r,"click",()=>{this.snapToIndex(this.getActiveIndex()-1),this.playTone(460,"sine",.04,.08)}),c&&t(c,"click",()=>{this.snapToIndex(this.getActiveIndex()+1),this.playTone(520,"sine",.04,.08)}),t(window,"keydown",h=>{if(h.key==="Escape"){this.activeDrawerProject&&this.closeCaseStudy();return}this.activeDrawerProject||this.viewMode==="grid"||(h.key==="ArrowRight"||h.key==="ArrowDown"?(h.preventDefault(),this.snapToIndex(this.getActiveIndex()+1),this.playTone(520,"sine",.04,.08)):(h.key==="ArrowLeft"||h.key==="ArrowUp")&&(h.preventDefault(),this.snapToIndex(this.getActiveIndex()-1),this.playTone(460,"sine",.04,.08)))});const n=this.wrapper.querySelector("#atScrubRail");n&&t(n,"click",d=>{const u=n.getBoundingClientRect(),m=Math.max(0,Math.min(1,(d.clientX-u.left)/u.width)),g=Math.round(m*(this.numItems-1));this.snapToIndex(g),this.playTone(600,"sine",.05,.08)}),t(window,"resize",()=>{this.resizeCanvas()})}getActiveIndex(){return(Math.round(this.scrollPos)%this.numItems+this.numItems)%this.numItems}snapToIndex(t){const i=this.getActiveIndex();let e=t-i;e>this.numItems/2&&(e-=this.numItems),e<-this.numItems/2&&(e+=this.numItems),this.targetScrollPos=Math.round(this.scrollPos)+e}openCaseStudy(t){this.activeDrawerProject=t,this.playTone(740,"triangle",.08,.1);const i=this.wrapper.querySelector("#atDrawerPanel");if(!i)return;i.innerHTML=`
      <!-- Top Cyber File Bar -->
      <div class="at-drawer__bar">
        <div class="at-drawer__status-pill">
          <span class="at-hud-dot"></span>
          <span>OCIMOH // CASE FILE // ${t.year}</span>
        </div>
        <button class="at-drawer__close-btn" id="atDrawerClose" type="button" aria-label="Close Case Study">
          <span>CLOSE [ESC]</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Drawer Content Scroll -->
      <div class="at-drawer__scroll">
        <!-- Hero Device Preview Frame -->
        <div class="at-drawer__hero">
          <div class="at-drawer__screen-frame" style="border-color: ${t.color}88;">
            <img src="${t.previewImageUrl}" alt="${t.title}" class="at-drawer__hero-img" />
            <div class="at-drawer__hero-badge" style="background: ${t.color}; color: #050608;">
              ${t.isLive?"● LIVE PRODUCTION":"GITHUB REPOSITORY"}
            </div>
          </div>
        </div>

        <!-- Primary Action CTA Row (Launch Live & View GitHub) -->
        <div class="at-drawer__actions">
          ${t.isLive?`
            <a href="${t.liveUrl}" target="_blank" rel="noopener noreferrer" class="at-action-btn at-action-btn--primary" style="background: ${t.color}; color: #050608;">
              <span>LAUNCH LIVE WEBSITE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </a>
          `:""}
          <a href="${t.githubUrl}" target="_blank" rel="noopener noreferrer" class="at-action-btn at-action-btn--secondary">
            <span>VIEW SOURCE ON GITHUB</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </a>
        </div>

        <!-- Project Title & Metadata Grid -->
        <div class="at-drawer__meta-grid">
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">CLIENT // ENTITY</span>
            <div class="at-drawer__val">${t.client}</div>
          </div>
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">TIMELINE</span>
            <div class="at-drawer__val">${t.year}</div>
          </div>
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">SECTOR</span>
            <div class="at-drawer__val">${t.category}</div>
          </div>
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">BENCHMARK</span>
            <div class="at-drawer__val" style="color: ${t.color}; font-weight: 700;">${t.metrics}</div>
          </div>
        </div>

        <h1 class="at-drawer__title">${t.title}</h1>
        <p class="at-drawer__desc">${t.description}</p>

        <!-- Engineering Highlights Checklist -->
        <div class="at-drawer__highlights">
          <h4 class="at-drawer__section-title">ENGINEERING & ARCHITECTURE HIGHLIGHTS</h4>
          <ul class="at-drawer__list">
            ${t.highlights.map(a=>`<li><span class="at-check" style="color:${t.color};">✦</span> <span>${a}</span></li>`).join("")}
          </ul>
        </div>

        <!-- Full Technical Architecture Tags -->
        <div class="at-drawer__tech-section">
          <h4 class="at-drawer__section-title">TECHNICAL STACK SPECIFICATION</h4>
          <div class="at-drawer__tags">
            ${t.techStack.map(a=>`<span class="at-tag">${a}</span>`).join("")}
          </div>
        </div>
      </div>
    `;const e=i.querySelector("#atDrawerClose");e&&e.addEventListener("click",()=>this.closeCaseStudy());const s=this.wrapper.querySelector("#atDrawerBackdrop");s&&s.addEventListener("click",()=>this.closeCaseStudy()),this.drawerElement.classList.add("is-open"),this.drawerElement.setAttribute("aria-hidden","false"),this.onSelectProject&&this.onSelectProject(t)}closeCaseStudy(){this.drawerElement&&(this.drawerElement.classList.remove("is-open"),this.drawerElement.setAttribute("aria-hidden","true"),this.activeDrawerProject=null,this.playTone(380,"sine",.04,.06))}loop(){if(!this.isRunning)return;if(this.mouseX+=(this.targetMouseX-this.mouseX)*.08,this.mouseY+=(this.targetMouseY-this.mouseY)*.08,this.isDragging)this.scrollPos+=(this.targetScrollPos-this.scrollPos)*.25;else{const i=this.targetScrollPos-this.scrollPos;this.velocity=i*.11,this.scrollPos+=this.velocity}const t=this.getActiveIndex();t!==this.lastActiveIndex&&(this.lastActiveIndex=t,this.playTone(t%2===0?540:620,"sine",.035,.05)),this.renderCanvas(),this.viewMode==="stream"&&this.renderStream(),this.renderHUD(),this.animationFrameId=requestAnimationFrame(this.loop)}renderCanvas(){if(!this.ctx||!this.canvas)return;const t=this.ctx,i=this.canvas.width/(window.devicePixelRatio||1),e=this.canvas.height/(window.devicePixelRatio||1),s=i*.5,a=e*.5;t.clearRect(0,0,i,e),t.save(),t.lineWidth=1,t.strokeStyle="rgba(0, 210, 255, 0.05)";const r=s+this.mouseX*35,c=a+this.mouseY*20;for(let h=1;h<=6;h++){const d=h/6,u=i*Math.pow(d,1.6),m=e*Math.pow(d,1.6);t.strokeRect(s-u*.5,a-m*.5,u,m)}const l=14;for(let h=0;h<=l;h++){const d=h/l*i;t.beginPath(),t.moveTo(r,c),t.lineTo(d,e),t.stroke()}t.restore();const n=1+Math.abs(this.velocity)*1.5;for(let h=0;h<this.particles.length;h++){const d=this.particles[h];d.z-=d.speedZ*n,d.x-=this.velocity*40,d.z<=10&&(d.z=1e3,d.x=(Math.random()-.5)*i*1.6,d.y=(Math.random()-.5)*e*1.6),d.x>i*.8&&(d.x=-i*.8),d.x<-i*.8&&(d.x=i*.8);const u=350,m=u/(u+d.z),g=s+(d.x+this.mouseX*40)*m,v=a+(d.y+this.mouseY*40)*m,f=Math.max(.6,d.size*m*1.4),b=Math.max(.05,Math.min(.85,(1-d.z/1e3)*d.alpha));t.fillStyle=`rgba(160, 230, 255, ${b})`,t.beginPath(),t.arc(g,v,f,0,Math.PI*2),t.fill()}const p=performance.now();if(this.mouseTrail=this.mouseTrail.filter(h=>p-h.time<500),this.mouseTrail.length>2){t.save(),t.globalCompositeOperation="screen";for(let h=1;h<this.mouseTrail.length;h++){const d=this.mouseTrail[h-1],u=this.mouseTrail[h],m=(p-u.time)/500,g=(1-m)*.6,v=(1-m)*16+2;t.strokeStyle=u.color||"#00d2ff",t.globalAlpha=g,t.lineWidth=v,t.lineCap="round",t.lineJoin="round",t.beginPath(),t.moveTo(d.x,d.y),t.lineTo(u.x,u.y),t.stroke()}t.restore()}}renderStream(){const t=window.innerWidth,i=Math.min(t*.62,780),e=-this.mouseY*8,s=this.mouseX*12;for(let a=0;a<this.numItems;a++){const r=this.cardElements[a];if(!r)continue;let c=a-this.scrollPos;for(;c>this.numItems/2;)c-=this.numItems;for(;c<-this.numItems/2;)c+=this.numItems;const l=Math.abs(c),n=c*i+this.mouseX*30,p=-Math.pow(l,1.18)*220-Math.abs(this.velocity)*45,h=-c*15+s,d=e,u=Math.max(.68,1-l*.12),m=Math.max(.12,1-l*.38),g=Math.min(8,l*2.8);r.style.transform=`translate3d(${n}px, -50%, ${p}px) rotateY(${h}deg) rotateX(${d}deg) scale(${u})`,r.style.opacity=String(m),r.style.filter=g>.4?`blur(${g}px)`:"none",r.style.zIndex=String(100-Math.round(l*10)),l<.5?(r.classList.add("is-active-front"),r.style.pointerEvents="auto"):(r.classList.remove("is-active-front"),r.style.pointerEvents=l<1.8?"auto":"none")}}renderHUD(){const t=this.getActiveIndex(),i=this.projects[t];if(this.hudCounter&&(this.hudCounter.textContent=`${String(t+1).padStart(2,"0")} / ${String(this.numItems).padStart(2,"0")}`),this.activeTitleDisplay&&i&&this.activeTitleDisplay.textContent!==i.title&&(this.activeTitleDisplay.textContent=i.title),this.activeClientDisplay&&i){const s=`${i.client} // ${i.category}`;this.activeClientDisplay.textContent!==s&&(this.activeClientDisplay.textContent=s)}if(this.progressBar){const a=(this.scrollPos%this.numItems+this.numItems)%this.numItems/(this.numItems-1)*100;this.progressBar.style.left=`${Math.max(0,Math.min(100,a))}%`}if(this.wrapper.querySelectorAll(".at-scrub-dot").forEach((s,a)=>{a===t?s.classList.add("is-active"):s.classList.remove("is-active")}),this.hudCoords){const s="60.0",a=this.scrollPos.toFixed(2);this.hudCoords.textContent=`${s} FPS // POS: ${a} // MATRIX: 3D SPATIAL TUNNEL`}}destroy(){if(this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.audioCtx){try{this.audioCtx.close()}catch{}this.audioCtx=null}this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper)}}class tt{container;products;onSelectProduct;wrapper;textColumn;visualColumn;textPanels=[];visualPanels=[];counterCurrent;counterTotal;scrubProgress;prevBtn;nextBtn;currentPos=0;targetPos=0;velocity=0;lastPos=0;lerpFactor=.082;snapTimeoutId=0;isSnapping=!1;isDragging=!1;hasDragged=!1;startY=0;startTargetPos=0;lastDragY=0;lastDragTime=0;dragVelocity=0;isMobile=!1;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.checkMobile(),this.buildDOM(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}checkMobile(){this.isMobile=window.innerWidth<860}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="split-carousel",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Bi-Directional Editorial Split Showcase");const t=String(this.products.length).padStart(2,"0");this.wrapper.innerHTML=`
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
    `,this.container.appendChild(this.wrapper),this.textColumn=this.wrapper.querySelector("#splitTextCol"),this.visualColumn=this.wrapper.querySelector("#splitVisualCol"),this.counterCurrent=this.wrapper.querySelector("#splitCounterNow"),this.counterTotal=this.wrapper.querySelector("#splitCounterTotal"),this.scrubProgress=this.wrapper.querySelector("#splitScrubBar"),this.prevBtn=this.wrapper.querySelector("#splitPrevBtn"),this.nextBtn=this.wrapper.querySelector("#splitNextBtn"),this.products.forEach((i,e)=>{const s=String(e+1).padStart(2,"0"),a=i.category.toUpperCase(),r=document.createElement("article");r.className="split-text-panel",r.dataset.index=String(e);const c=i.ingredients.slice(0,4).map(p=>`<span class="split-text-panel__pill">${p}</span>`).join("");r.innerHTML=`
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
              ${c}
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
      `;const l=r.querySelector(".split-text-panel__cta");l&&l.addEventListener("click",()=>{this.onSelectProduct&&this.onSelectProduct(i)}),this.textColumn.appendChild(r),this.textPanels.push(r);const n=document.createElement("div");n.className="split-visual-panel",n.dataset.index=String(e),n.innerHTML=`
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
      `,n.addEventListener("click",()=>{if(this.hasDragged)return;const p=Math.round(this.currentPos);e===p?this.onSelectProduct&&this.onSelectProduct(i):this.snapToIndex(e)}),this.visualColumn.appendChild(n),this.visualPanels.push(n)})}bindEvents(){const t=(n,p,h,d)=>{n.addEventListener(p,h,d),this.boundEvents.push({target:n,type:p,handler:h,options:d})},i=n=>{if(!n.target.closest("button, .split-carousel__scrub")){this.isDragging=!0,this.hasDragged=!1,this.startY=n.clientY,this.lastDragY=n.clientY,this.lastDragTime=performance.now(),this.startTargetPos=this.targetPos,this.dragVelocity=0;try{n.target.setPointerCapture(n.pointerId)}catch{}}},e=n=>{if(!this.isDragging)return;const p=n.clientY-this.startY;!this.hasDragged&&Math.abs(p)>6&&(this.hasDragged=!0);const h=window.innerHeight||800,d=-(p/(h*.75));this.targetPos=Math.max(-.25,Math.min(this.products.length-.75,this.startTargetPos+d));const u=performance.now(),m=Math.max(1,u-this.lastDragTime),g=n.clientY-this.lastDragY;this.dragVelocity=g/m*16.67,this.lastDragY=n.clientY,this.lastDragTime=u},s=n=>{if(this.isDragging){this.isDragging=!1;try{n.target.releasePointerCapture(n.pointerId)}catch{}if(Math.abs(this.dragVelocity)>4){const p=-(this.dragVelocity/60);this.targetPos+=p}this.snapToNearest()}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=n=>{n.preventDefault();const p=n.deltaY,h=.0018;this.targetPos=Math.max(0,Math.min(this.products.length-1,this.targetPos+p*h)),window.clearTimeout(this.snapTimeoutId),this.isSnapping=!1,this.snapTimeoutId=window.setTimeout(()=>{this.snapToNearest()},120)};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",n=>{n.key==="ArrowDown"||n.key==="ArrowRight"?(n.preventDefault(),this.stepBy(1)):(n.key==="ArrowUp"||n.key==="ArrowLeft")&&(n.preventDefault(),this.stepBy(-1))}),this.prevBtn&&t(this.prevBtn,"click",()=>this.stepBy(-1)),this.nextBtn&&t(this.nextBtn,"click",()=>this.stepBy(1));const c=this.wrapper.querySelector("#splitScrubRail");c&&t(c,"pointerdown",n=>{const p=n,h=c.getBoundingClientRect(),d=Math.max(0,Math.min(1,(p.clientY-h.top)/h.height)),u=Math.round(d*(this.products.length-1));this.snapToIndex(u)}),t(window,"resize",()=>{this.checkMobile()})}stepBy(t){const i=Math.round(this.currentPos),e=Math.max(0,Math.min(this.products.length-1,i+t));this.snapToIndex(e)}snapToIndex(t){this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}snapToNearest(){const t=Math.round(this.targetPos);this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}loop(){this.isRunning&&(this.currentPos+=(this.targetPos-this.currentPos)*this.lerpFactor,this.velocity=(this.currentPos-this.lastPos)*60,this.lastPos=this.currentPos,this.renderColumns(),this.renderHUD(),this.animationFrameId=requestAnimationFrame(this.loop))}renderColumns(){const t=this.products.length;for(let i=0;i<t;i++){const e=this.textPanels[i],s=this.visualPanels[i];if(!e||!s)continue;const a=i-this.currentPos,r=a*100,c=Math.max(.78,1-Math.abs(a)*.18),l=Math.max(0,Math.min(1,1-Math.abs(a)*.85)),n=-a*45;s.style.transform=`translate3d(0, ${r.toFixed(2)}%, 0)`,s.style.opacity=l.toFixed(3),s.style.pointerEvents=Math.abs(a)<.4?"auto":"none";const p=s.querySelector(".split-visual-panel__img");p&&(p.style.transform=`translate3d(0, ${n.toFixed(1)}px, 0) scale(${c.toFixed(3)})`);const h=this.isMobile?a*100:-a*100,d=Math.max(0,Math.min(1,1-Math.abs(a)*.95));e.style.transform=`translate3d(0, ${h.toFixed(2)}%, 0)`,e.style.opacity=d.toFixed(3),e.style.pointerEvents=Math.abs(a)<.4?"auto":"none";const u=e.querySelector(".split-text-panel__title"),m=e.querySelector(".split-text-panel__desc"),g=e.querySelector(".split-text-panel__footer");if(u&&m&&g){const v=this.isMobile?a*25:-a*35,f=this.isMobile?a*18:-a*22;u.style.transform=`translate3d(0, ${v.toFixed(1)}px, 0)`,m.style.transform=`translate3d(0, ${f.toFixed(1)}px, 0)`}Math.abs(a)<.35?(e.classList.add("is-active-editorial"),s.classList.add("is-active-editorial")):(e.classList.remove("is-active-editorial"),s.classList.remove("is-active-editorial"))}}renderHUD(){const t=Math.max(0,Math.min(this.products.length-1,Math.round(this.currentPos)));if(this.counterCurrent&&(this.counterCurrent.textContent=String(t+1).padStart(2,"0")),this.scrubProgress){const i=this.currentPos/(this.products.length-1),e=Math.max(0,Math.min(100,i*100));this.scrubProgress.style.height=`${e.toFixed(1)}%`}this.prevBtn&&(this.prevBtn.style.opacity=t===0?"0.35":"1",this.prevBtn.style.pointerEvents=t===0?"none":"auto"),this.nextBtn&&(this.nextBtn.style.opacity=t===this.products.length-1?"0.35":"1",this.nextBtn.style.pointerEvents=t===this.products.length-1?"none":"auto")}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),window.clearTimeout(this.snapTimeoutId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.textPanels=[],this.visualPanels=[]}}class et{container;products;onSelectProduct;wrapper;astrolabeSvg;orbitTrack;cardElements=[];zenithInfoBox;azimuthText;counterText;scrubProgress;prevBtn;nextBtn;angle=0;targetAngle=0;velocity=0;lastAngle=0;numItems;angleStep=.38;lerpFactor=.075;snapTimeoutId=0;pivotX=0;pivotY=0;radiusX=820;radiusY=700;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetAngle=0;lastClientX=0;lastDragTime=0;dragVelocity=0;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.numItems=this.products.length,this.buildDOM(),this.updateDimensions(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="orbital-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Off-Screen Orbital Sundial Arc Showcase");const t=String(this.numItems).padStart(2,"0");this.wrapper.innerHTML=`
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
            ${Array.from({length:72}).map((e,s)=>{const a=s*5,r=a%30===0,c=r?920:1040,l=1080,n=a*Math.PI/180,p=Math.cos(n)*c,h=Math.sin(n)*c,d=Math.cos(n)*l,u=Math.sin(n)*l;return`<line x1="${p.toFixed(1)}" y1="${h.toFixed(1)}" x2="${d.toFixed(1)}" y2="${u.toFixed(1)}" stroke="${r?"#E94E1B":"rgba(118, 37, 48, 0.3)"}" stroke-width="${r?"2":"1"}"/>`}).join("")}
          </g>

          <!-- Roman Astrolabe Degree Numerals -->
          <g class="orbital-astrolabe__texts" fill="rgba(118, 37, 48, 0.55)" font-family="Cinzel, Georgia, serif" font-size="16" letter-spacing="0.15em">
            ${["0° • ARIES","30° • ETNA MIDDAY","60° • SOLLEONE","90° • EAST HORIZON","120° • AUTUNNO","150° • RACCOLTO","180° • NADIR","210° • VENDEMMIA","240° • TRAMONTO","270° • WEST HORIZON","300° • EQUINOZIO","330° • MEDITERRANEO"].map((e,s)=>{const a=s*30-90,r=a*Math.PI/180,c=Math.cos(r)*980,l=Math.sin(r)*980;return`<text x="${c.toFixed(1)}" y="${l.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${a+90}, ${c.toFixed(1)}, ${l.toFixed(1)})">${e}</text>`}).join("")}
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
      `,a.addEventListener("click",c=>{if(this.hasDragged){c.preventDefault();return}const l=this.getActiveIndex();s===l?this.onSelectProduct&&this.onSelectProduct(e):this.snapToIndex(s)}),this.orbitTrack.appendChild(a),this.cardElements.push(a)});const i=this.wrapper.querySelector("#orbitalZenithCta");i&&i.addEventListener("click",()=>{const e=this.getActiveIndex(),s=this.products[e];s&&this.onSelectProduct&&this.onSelectProduct(s)})}updateDimensions(){const t=window.innerWidth,i=window.innerHeight;this.pivotX=t*.5,t<600?(this.radiusX=t*.72,this.radiusY=i*.52,this.pivotY=i+this.radiusY*.38,this.angleStep=.52):t<1024?(this.radiusX=t*.58,this.radiusY=i*.62,this.pivotY=i+this.radiusY*.48,this.angleStep=.42):(this.radiusX=Math.min(880,t*.52),this.radiusY=Math.min(760,i*.68),this.pivotY=i+this.radiusY*.52,this.angleStep=.36);const e=this.wrapper.querySelector("#orbitalDialWrap");e&&(e.style.left=`${this.pivotX}px`,e.style.top=`${this.pivotY}px`)}bindEvents(){const t=(n,p,h,d)=>{n.addEventListener(p,h,d),this.boundEvents.push({target:n,type:p,handler:h,options:d})},i=n=>{if(!n.target.closest("button, .orbital-scrub-rail, .orbital-zenith-info")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=n.clientX,this.startClientY=n.clientY,this.lastClientX=n.clientX,this.lastDragTime=performance.now(),this.startTargetAngle=this.targetAngle,this.dragVelocity=0;try{n.target.setPointerCapture(n.pointerId)}catch{}}},e=n=>{if(!this.isDragging)return;const p=n.clientX-this.startClientX,h=n.clientY-this.startClientY;!this.hasDragged&&(Math.abs(p)>6||Math.abs(h)>6)&&(this.hasDragged=!0);const d=p/(this.radiusX*1.1);this.targetAngle=this.startTargetAngle+d;const u=performance.now(),m=Math.max(1,u-this.lastDragTime),g=n.clientX-this.lastClientX;this.dragVelocity=g/m*16.67,this.lastClientX=n.clientX,this.lastDragTime=u},s=n=>{if(this.isDragging){this.isDragging=!1;try{n.target.releasePointerCapture(n.pointerId)}catch{}if(Math.abs(this.dragVelocity)>3){const p=this.dragVelocity/this.radiusX*.95;this.targetAngle+=p}this.snapToNearest()}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=n=>{n.preventDefault();const p=Math.abs(n.deltaX)>Math.abs(n.deltaY)?n.deltaX:n.deltaY,h=.0016;this.targetAngle-=p*h,window.clearTimeout(this.snapTimeoutId),this.snapTimeoutId=window.setTimeout(()=>{this.snapToNearest()},140)};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",n=>{n.key==="ArrowRight"||n.key==="ArrowDown"?(n.preventDefault(),this.stepBy(1)):(n.key==="ArrowLeft"||n.key==="ArrowUp")&&(n.preventDefault(),this.stepBy(-1))}),this.prevBtn&&t(this.prevBtn,"click",()=>this.stepBy(-1)),this.nextBtn&&t(this.nextBtn,"click",()=>this.stepBy(1));const c=this.wrapper.querySelector("#orbitalScrubRail");c&&t(c,"pointerdown",n=>{const p=n,h=c.getBoundingClientRect(),d=Math.max(0,Math.min(1,(p.clientX-h.left)/h.width)),u=Math.round(d*(this.numItems-1));this.snapToIndex(u)}),t(window,"resize",()=>{this.updateDimensions()})}stepBy(t){const e=(this.getActiveIndex()+t+this.numItems)%this.numItems;this.snapToIndex(e)}snapToIndex(t){const i=-t*this.angleStep,e=Math.round(this.targetAngle/(Math.PI*2));let s=i+e*(Math.PI*2);const a=s-this.targetAngle;a>Math.PI&&(s-=Math.PI*2),a<-Math.PI&&(s+=Math.PI*2),this.targetAngle=s}snapToNearest(){const t=this.getActiveIndex();this.snapToIndex(t)}getActiveIndex(){const i=(-this.angle/this.angleStep%this.numItems+this.numItems)%this.numItems;return Math.round(i)%this.numItems}loop(){if(this.isRunning){if(this.angle+=(this.targetAngle-this.angle)*this.lerpFactor,this.velocity=(this.angle-this.lastAngle)*60,this.lastAngle=this.angle,this.astrolabeSvg){const t=this.angle*180/Math.PI;this.astrolabeSvg.style.transform=`rotate(${t.toFixed(2)}deg)`}this.renderOrbit(),this.renderHUD(),this.animationFrameId=requestAnimationFrame(this.loop)}}renderOrbit(){for(let t=0;t<this.numItems;t++){const i=this.cardElements[t];if(!i)continue;let s=((this.angle+t*this.angleStep)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;const a=this.pivotX+Math.sin(s)*this.radiusX,r=this.pivotY-Math.cos(s)*this.radiusY,c=s*(180/Math.PI)*.78,l=Math.abs(s),n=Math.max(.55,1-l*.32),p=Math.max(0,Math.min(1,1-(l-.28)*1.5)),h=Math.max(0,(l-.4)*12),d=Math.round(1e3-l*500);i.style.transform=`
        translate3d(${a.toFixed(1)}px, ${r.toFixed(1)}px, 0)
        translate(-50%, -50%)
        rotate(${c.toFixed(2)}deg)
        scale(${n.toFixed(3)})
      `,i.style.opacity=p.toFixed(3),i.style.zIndex=String(d),i.style.filter=h>.8?`blur(${h.toFixed(1)}px)`:"none",i.style.pointerEvents=l<.38?"auto":"none",l<.16?i.classList.add("is-zenith"):i.classList.remove("is-zenith")}}renderHUD(){const t=this.getActiveIndex(),i=this.products[t];if(this.counterText&&(this.counterText.textContent=`${String(t+1).padStart(2,"0")} / ${String(this.numItems).padStart(2,"0")}`),this.azimuthText){const e=-this.angle*180/Math.PI%360,s=Math.round((e+360)%360);this.azimuthText.textContent=`AZIMUTH ${String(s).padStart(3,"0")}° 00' // HARVEST ZENITH`}if(this.scrubProgress){const s=(-this.angle/this.angleStep%this.numItems+this.numItems)%this.numItems/(this.numItems-1)*100;this.scrubProgress.style.left=`${Math.max(0,Math.min(100,s)).toFixed(1)}%`}if(i&&this.zenithInfoBox){const e=this.zenithInfoBox.querySelector("#orbitalZenithCategory"),s=this.zenithInfoBox.querySelector("#orbitalZenithTitle"),a=this.zenithInfoBox.querySelector("#orbitalZenithSub"),r=this.zenithInfoBox.querySelector("#orbitalZenithPrice"),c=this.zenithInfoBox.querySelector("#orbitalZenithWeight");e&&e.textContent!==i.category.toUpperCase()&&(e.textContent=`${i.category.toUpperCase()} • ZENITH RESERVE`),s&&s.textContent!==i.title&&(s.textContent=i.title),a&&a.textContent!==i.latinSubtitle&&(a.textContent=i.latinSubtitle),r&&r.textContent!==i.price&&(r.textContent=i.price),c&&c.textContent!==i.weight&&(c.textContent=i.weight)}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),window.clearTimeout(this.snapTimeoutId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.cardElements=[]}}class it{container;products;onSelectProduct;wrapper;grainCanvas;grainCtx=null;filmStrip;filmFrames=[];tcDisplay;reelDisplay;creditsContainer;progressBar;prevBtn;nextBtn;currentPos=0;targetPos=0;velocity=0;lastPos=0;lerpFactor=.078;dollyScale=1;snapTimeoutId=0;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetPos=0;lastClientX=0;lastDragTime=0;dragVelocity=0;lastGrainTime=0;grainInterval=1e3/24;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.buildDOM(),this.initGrainCanvas(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="a24-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","A24 35mm Cinema Film Strip Showcase");const t=String(this.products.length).padStart(2,"0");this.wrapper.innerHTML=`
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

          <!-- Anamorphic Jar Stage with Atmospheric Light & 35mm Terroir Scene Projection -->
          <div class="a24-frame__stage">
            <div class="a24-frame__scene-bg">
              <img 
                class="a24-frame__scene-img" 
                src="${e.sceneUrl||e.jarUrl}" 
                alt="${e.title}" 
                loading="${s<3?"eager":"lazy"}" 
                decoding="async" 
                draggable="false"
              />
              <div class="a24-frame__scene-vignette"></div>
            </div>
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
      `,a.addEventListener("click",c=>{if(this.hasDragged){c.preventDefault();return}const l=Math.round(this.currentPos);s===l?this.onSelectProduct&&this.onSelectProduct(e):this.snapToIndex(s)}),this.filmStrip.appendChild(a),this.filmFrames.push(a)});const i=this.wrapper.querySelector("#a24ScreenBtn");i&&i.addEventListener("click",()=>{const e=Math.max(0,Math.min(this.products.length-1,Math.round(this.currentPos))),s=this.products[e];s&&this.onSelectProduct&&this.onSelectProduct(s)})}initGrainCanvas(){this.grainCtx=this.grainCanvas.getContext("2d",{alpha:!0}),this.resizeGrain()}resizeGrain(){if(!this.grainCanvas)return;const t=window.innerWidth,i=window.innerHeight;this.grainCanvas.width=Math.min(t,512),this.grainCanvas.height=Math.min(i,512)}renderGrain(){if(!this.grainCtx||!this.grainCanvas)return;const t=this.grainCtx,i=this.grainCanvas.width,e=this.grainCanvas.height,s=t.createImageData(i,e),a=new Uint32Array(s.data.buffer),r=a.length;for(let c=0;c<r;c++)if(Math.random()<.08){const l=Math.floor(Math.random()*22+8);a[c]=l<<24|35<<16|11520|70}t.putImageData(s,0,0)}bindEvents(){const t=(n,p,h,d)=>{n.addEventListener(p,h,d),this.boundEvents.push({target:n,type:p,handler:h,options:d})},i=n=>{if(!n.target.closest("button, .a24-scrub-rail, .a24-credits")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=n.clientX,this.startClientY=n.clientY,this.lastClientX=n.clientX,this.lastDragTime=performance.now(),this.startTargetPos=this.targetPos,this.dragVelocity=0;try{n.target.setPointerCapture(n.pointerId)}catch{}}},e=n=>{if(!this.isDragging)return;const p=n.clientX-this.startClientX,h=n.clientY-this.startClientY;!this.hasDragged&&(Math.abs(p)>6||Math.abs(h)>6)&&(this.hasDragged=!0);const d=window.innerWidth||1200,u=-(p/(d*.55));this.targetPos=Math.max(-.2,Math.min(this.products.length-.8,this.startTargetPos+u));const m=performance.now(),g=Math.max(1,m-this.lastDragTime),v=n.clientX-this.lastClientX;this.dragVelocity=v/g*16.67,this.lastClientX=n.clientX,this.lastDragTime=m},s=n=>{if(this.isDragging){this.isDragging=!1;try{n.target.releasePointerCapture(n.pointerId)}catch{}if(Math.abs(this.dragVelocity)>3){const p=-(this.dragVelocity/50);this.targetPos+=p}this.snapToNearest()}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=n=>{n.preventDefault();const p=Math.abs(n.deltaX)>Math.abs(n.deltaY)?n.deltaX:n.deltaY,h=.0016;this.targetPos=Math.max(0,Math.min(this.products.length-1,this.targetPos+p*h)),window.clearTimeout(this.snapTimeoutId),this.snapTimeoutId=window.setTimeout(()=>{this.snapToNearest()},130)};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",n=>{n.key==="ArrowRight"||n.key==="ArrowDown"?(n.preventDefault(),this.stepBy(1)):(n.key==="ArrowLeft"||n.key==="ArrowUp")&&(n.preventDefault(),this.stepBy(-1))}),this.prevBtn&&t(this.prevBtn,"click",()=>this.stepBy(-1)),this.nextBtn&&t(this.nextBtn,"click",()=>this.stepBy(1));const c=this.wrapper.querySelector("#a24ScrubRail");c&&t(c,"pointerdown",n=>{const p=n,h=c.getBoundingClientRect(),d=Math.max(0,Math.min(1,(p.clientX-h.left)/h.width)),u=Math.round(d*(this.products.length-1));this.snapToIndex(u)}),t(window,"resize",()=>{this.resizeGrain()})}stepBy(t){const i=Math.round(this.currentPos),e=Math.max(0,Math.min(this.products.length-1,i+t));this.snapToIndex(e)}snapToIndex(t){this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}snapToNearest(){const t=Math.round(this.targetPos);this.targetPos=Math.max(0,Math.min(this.products.length-1,t))}loop(t){if(!this.isRunning)return;this.currentPos+=(this.targetPos-this.currentPos)*this.lerpFactor,this.velocity=(this.currentPos-this.lastPos)*60,this.lastPos=this.currentPos;const i=1-Math.min(.08,Math.abs(this.velocity)*.024);this.dollyScale+=(i-this.dollyScale)*.12,t-this.lastGrainTime>this.grainInterval&&(this.renderGrain(),this.lastGrainTime=t),this.renderFilmStrip(),this.renderHUD(t),this.animationFrameId=requestAnimationFrame(this.loop)}renderFilmStrip(){const t=this.products.length,i=window.innerWidth,e=Math.min(540,i*.58),s=Math.max(-3.5,Math.min(3.5,-this.velocity*1.8));for(let a=0;a<t;a++){const r=this.filmFrames[a];if(!r)continue;const c=a-this.currentPos,l=c*e,n=Math.max(.72,1-Math.abs(c)*.22)*this.dollyScale,p=Math.max(.12,Math.min(1,1-Math.abs(c)*.65)),h=Math.round(1e3-Math.abs(c)*500);r.style.transform=`
        translate3d(calc(-50% + ${l.toFixed(1)}px), -50%, 0)
        rotateZ(${s.toFixed(2)}deg)
        scale(${n.toFixed(3)})
      `,r.style.opacity=p.toFixed(3),r.style.zIndex=String(h),r.style.pointerEvents=Math.abs(c)<.45?"auto":"none";const d=r.querySelector(".a24-frame__jar-img");if(d){const u=-c*35;d.style.transform=`translate3d(${u.toFixed(1)}px, 0, 0)`}Math.abs(c)<.35?r.classList.add("is-active-reel"):r.classList.remove("is-active-reel")}}renderHUD(t){const i=Math.max(0,Math.min(this.products.length-1,Math.round(this.currentPos))),e=this.products[i];if(this.reelDisplay&&(this.reelDisplay.textContent=`${String(i+1).padStart(2,"0")} / ${String(this.products.length).padStart(2,"0")}`),this.tcDisplay){const s=Math.floor(t/1e3),a=Math.floor(t%1e3/(1e3/24)),r=String(s%60).padStart(2,"0"),c=String(Math.floor(s/60)%60).padStart(2,"0"),l=String(a).padStart(2,"0");this.tcDisplay.textContent=`00:${c}:${r}:${l}`}if(this.progressBar){const s=this.currentPos/(this.products.length-1),a=Math.max(0,Math.min(100,s*100));this.progressBar.style.left=`${a.toFixed(1)}%`}if(e&&this.creditsContainer){const s=this.creditsContainer.querySelector("#a24CreditCategory"),a=this.creditsContainer.querySelector("#a24CreditTitle"),r=this.creditsContainer.querySelector("#a24CreditLatin"),c=this.creditsContainer.querySelector("#a24CreditOrigin"),l=this.creditsContainer.querySelector("#a24CreditIngredients"),n=this.creditsContainer.querySelector("#a24CreditPrice"),p=this.creditsContainer.querySelector("#a24CreditWeight");if(s&&s.textContent!==e.category.toUpperCase()&&(s.textContent=`${e.category.toUpperCase()} • 35MM SELECTION`),a&&a.textContent!==e.title&&(a.textContent=e.title),r&&r.textContent!==e.latinSubtitle&&(r.textContent=e.latinSubtitle),c&&c.textContent!==e.origin.toUpperCase()&&(c.textContent=e.origin.toUpperCase()),l){const h=e.ingredients.slice(0,3).join(", ").toUpperCase();l.textContent!==h&&(l.textContent=h)}n&&n.textContent!==e.price&&(n.textContent=e.price),p&&p.textContent!==e.weight&&(p.textContent=e.weight)}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),window.clearTimeout(this.snapTimeoutId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.filmFrames=[]}}class st{container;products;onSelectProduct;wrapper;reelTrack;tickElements=[];slatItems=[];currentX=0;targetX=0;velocity=0;lastX=0;lerpFactor=.085;defaultSlatWidth=85;expandedSlatWidth=320;slatGap=10;singleSetWidth=0;totalCopies=3;activeProductIndex=null;needsLayout=!0;lastActiveTickIdx=-1;isDragging=!1;hasDragged=!1;startClientX=0;startClientY=0;startTargetX=0;lastClientX=0;lastDragTime=0;dragVelocity=0;isRunning=!0;animationFrameId=0;boundEvents=[];constructor(t){this.container=t.container,this.products=t.products,this.onSelectProduct=t.onSelectProduct,this.calculateDimensions(),this.buildDOM(),this.bindEvents(),this.loop=this.loop.bind(this),this.animationFrameId=requestAnimationFrame(this.loop)}calculateDimensions(){const t=window.innerWidth;t<600?(this.defaultSlatWidth=58,this.expandedSlatWidth=240,this.slatGap=6):t<1024?(this.defaultSlatWidth=72,this.expandedSlatWidth=280,this.slatGap=8):(this.defaultSlatWidth=85,this.expandedSlatWidth=320,this.slatGap=10),this.singleSetWidth=this.products.length*(this.defaultSlatWidth+this.slatGap),this.wrapper&&(this.wrapper.style.setProperty("--slat-default-w",`${this.defaultSlatWidth}px`),this.wrapper.style.setProperty("--slat-expanded-w",`${this.expandedSlatWidth}px`)),this.needsLayout=!0}buildDOM(){this.wrapper=document.createElement("div"),this.wrapper.className="ab-showcase",this.wrapper.setAttribute("role","region"),this.wrapper.setAttribute("aria-label","Aristide Benoist Accordion Slats Reel Showcase"),this.wrapper.style.setProperty("--slat-default-w",`${this.defaultSlatWidth}px`),this.wrapper.style.setProperty("--slat-expanded-w",`${this.expandedSlatWidth}px`);const i=Array.from({length:42}).map((e,s)=>`<span class="ab-tick" data-tick="${s}"></span>`).join("");this.wrapper.innerHTML=`
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
    `,this.container.appendChild(this.wrapper),this.reelTrack=this.wrapper.querySelector("#abTrack"),this.tickElements=Array.from(this.wrapper.querySelectorAll(".ab-tick"));for(let e=0;e<this.totalCopies;e++)this.products.forEach((s,a)=>{const r=e*this.products.length+a,c=String(a+1).padStart(2,"0"),l=document.createElement("article");l.className="ab-slat",l.dataset.globalIndex=String(r),l.dataset.productIndex=String(a),l.dataset.slug=s.slug,l.innerHTML=`
          <div class="ab-slat__inner">
            <!-- Dual-Layer Terroir Scene Background (Monochrome base + GPU opacity crossfade to full color) -->
            <div class="ab-slat__scene-bg">
              <img 
                class="ab-slat__scene-img ab-slat__scene-img--mono" 
                src="${s.sceneUrl||s.jarUrl}" 
                alt="" 
                loading="${r<8?"eager":"lazy"}" 
                decoding="async" 
                draggable="false"
              />
              <img 
                class="ab-slat__scene-img ab-slat__scene-img--color" 
                src="${s.sceneUrl||s.jarUrl}" 
                alt="${s.title}" 
                loading="${r<8?"eager":"lazy"}" 
                decoding="async" 
                draggable="false"
              />
              <div class="ab-slat__scrim"></div>
            </div>

            <!-- Hero 3D Cutout Jar Layer -->
            <div class="ab-slat__jar-layer">
              <img 
                class="ab-slat__jar-img" 
                src="${s.jarUrl}" 
                alt="${s.title}" 
                loading="${r<8?"eager":"lazy"}" 
                decoding="async" 
                draggable="false"
              />
            </div>

            <!-- Idle Slat Spine Label (Vertical Numeral & Category) -->
            <div class="ab-slat__spine">
              <span class="ab-slat__num">${c}</span>
              <span class="ab-slat__cat-vert">${s.category.toUpperCase()}</span>
            </div>

            <!-- Expanded State Monograph Overlay -->
            <div class="ab-slat__expanded-content">
              <div class="ab-slat__halo"></div>
              <div class="ab-slat__meta-top">
                <span class="ab-slat__sec-id">SEC // ${c}</span>
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
        `,l.addEventListener("mouseenter",()=>{this.setHoveredProduct(a)}),l.addEventListener("mouseleave",()=>{this.activeProductIndex===a&&this.setHoveredProduct(null)}),l.addEventListener("click",n=>{if(this.hasDragged){n.preventDefault();return}n.target.closest(".ab-slat__cta-btn")||this.activeProductIndex===a?this.onSelectProduct&&this.onSelectProduct(s):(this.setHoveredProduct(a),this.centerOnSlat(r))}),this.reelTrack.appendChild(l),this.slatItems.push({element:l,product:s,productIndex:a,globalIndex:r,currentWidth:this.defaultSlatWidth,targetWidth:this.defaultSlatWidth,x:0})});this.targetX=-this.singleSetWidth,this.currentX=-this.singleSetWidth,this.lastX=this.currentX,this.needsLayout=!0}setHoveredProduct(t){this.activeProductIndex=t,this.slatItems.forEach(i=>{const e=i.productIndex===t;i.targetWidth=e?this.expandedSlatWidth:this.defaultSlatWidth,e?i.element.classList.add("is-expanded"):i.element.classList.remove("is-expanded")}),this.needsLayout=!0}centerOnSlat(t){const i=this.slatItems[t];if(!i)return;const e=i.x+i.targetWidth/2,s=window.innerWidth/2;this.targetX=-(e-s)}bindEvents(){const t=(l,n,p,h)=>{l.addEventListener(n,p,h),this.boundEvents.push({target:l,type:n,handler:p,options:h})},i=l=>{if(!l.target.closest("button, .ab-header, .ab-footer")){this.isDragging=!0,this.hasDragged=!1,this.startClientX=l.clientX,this.startClientY=l.clientY,this.lastClientX=l.clientX,this.lastDragTime=performance.now(),this.startTargetX=this.targetX,this.dragVelocity=0;try{l.target.setPointerCapture(l.pointerId)}catch{}}},e=l=>{if(!this.isDragging)return;const n=l.clientX-this.startClientX,p=l.clientY-this.startClientY;!this.hasDragged&&(Math.abs(n)>6||Math.abs(p)>6)&&(this.hasDragged=!0),this.targetX=this.startTargetX+n*1.25;const h=performance.now(),d=Math.max(1,h-this.lastDragTime),u=l.clientX-this.lastClientX;this.dragVelocity=u/d*16.67,this.lastClientX=l.clientX,this.lastDragTime=h},s=l=>{if(this.isDragging){this.isDragging=!1;try{l.target.releasePointerCapture(l.pointerId)}catch{}Math.abs(this.dragVelocity)>2&&(this.targetX+=this.dragVelocity*14)}};t(this.wrapper,"pointerdown",i),t(window,"pointermove",e),t(window,"pointerup",s),t(window,"pointercancel",s);const a=l=>{l.preventDefault();const n=Math.abs(l.deltaX)>Math.abs(l.deltaY)?l.deltaX:l.deltaY,p=1.35;this.targetX-=n*p};t(this.wrapper,"wheel",a,{passive:!1}),t(window,"keydown",l=>{const n=this.defaultSlatWidth+this.slatGap;l.key==="ArrowRight"?(l.preventDefault(),this.targetX-=n*2):l.key==="ArrowLeft"&&(l.preventDefault(),this.targetX+=n*2)}),t(window,"resize",()=>{this.calculateDimensions()})}loop(){if(!this.isRunning)return;this.currentX+=(this.targetX-this.currentX)*this.lerpFactor,this.velocity=(this.currentX-this.lastX)*60,this.lastX=this.currentX;let t=!1;for(let i=0;i<this.slatItems.length;i++){const e=this.slatItems[i],s=e.targetWidth-e.currentWidth;Math.abs(s)>.2?(e.currentWidth+=s*.18,e.element.style.width=`${e.currentWidth.toFixed(1)}px`,t=!0):e.currentWidth!==e.targetWidth&&(e.currentWidth=e.targetWidth,e.element.style.width=`${e.currentWidth}px`,t=!0)}if(t||this.needsLayout){this.needsLayout=!1;let i=0;for(let e=0;e<this.slatItems.length;e++){const s=this.slatItems[e];s.x=i,s.element.style.transform=`translate3d(${i.toFixed(1)}px, 0, 0)`,i+=s.currentWidth+this.slatGap}this.singleSetWidth=i/this.totalCopies}if(this.singleSetWidth>0){const i=-this.singleSetWidth*1.8,e=-this.singleSetWidth*.2;for(;this.currentX>e;)this.currentX-=this.singleSetWidth,this.targetX-=this.singleSetWidth;for(;this.currentX<i;)this.currentX+=this.singleSetWidth,this.targetX+=this.singleSetWidth}this.reelTrack&&(this.reelTrack.style.transform=`translate3d(${this.currentX}px, 0, 0)`),this.renderTicks(),this.animationFrameId=requestAnimationFrame(this.loop)}renderTicks(){if(!this.tickElements.length||this.singleSetWidth<=0)return;const i=(-this.currentX%this.singleSetWidth+this.singleSetWidth)%this.singleSetWidth/this.singleSetWidth,e=this.tickElements.length,s=Math.floor(i*e);if(s!==this.lastActiveTickIdx){this.lastActiveTickIdx=s;for(let a=0;a<e;a++){const r=this.tickElements[a],c=Math.abs(a-s);c===0?(r.style.background="var(--color-orange)",r.style.transform="scaleY(2.33)",r.style.opacity="1"):c===1?(r.style.background="rgba(229, 90, 43, 0.7)",r.style.transform="scaleY(1.8)",r.style.opacity="0.75"):c===2?(r.style.background="rgba(253, 243, 235, 0.5)",r.style.transform="scaleY(1.3)",r.style.opacity="0.45"):(r.style.background="rgba(253, 243, 235, 0.2)",r.style.transform="scaleY(1)",r.style.opacity="0.25")}}}destroy(){this.isRunning=!1,cancelAnimationFrame(this.animationFrameId),this.boundEvents.forEach(({target:t,type:i,handler:e,options:s})=>{t.removeEventListener(i,e,s)}),this.boundEvents=[],this.wrapper&&this.wrapper.parentElement&&this.wrapper.parentElement.removeChild(this.wrapper),this.slatItems=[],this.tickElements=[]}}const L={incline:{theme:"parchment",headerTheme:"light",bodyClass:"theme-parchment"},deck:{theme:"parchment",headerTheme:"light",bodyClass:"theme-parchment"},liquid:{theme:"amber",headerTheme:"dark",bodyClass:"theme-amber"},activetheory:{theme:"cyber",headerTheme:"dark",bodyClass:"theme-cyber"},split:{theme:"stone",headerTheme:"light",bodyClass:"theme-stone"},orbital:{theme:"astrolabe",headerTheme:"dark",bodyClass:"theme-astrolabe"},a24:{theme:"cinema",headerTheme:"dark",bodyClass:"theme-cinema"},aristide:{theme:"minimal",headerTheme:"dark",bodyClass:"theme-minimal"}};function at(){const o=document.createElement("div");o.className="view-home",o.innerHTML=`
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
  `;let t=null,i="incline";const e=l=>{window.history.pushState({},"",`/dispensa/${l.slug}`),window.dispatchEvent(new PopStateEvent("popstate"))},s=l=>{const n=o.querySelector("#carouselStage");if(!n)return;t&&(t.destroy(),t=null),n.innerHTML="",i=l;try{window.history.replaceState(null,"",`#${l}`)}catch{}const p=L[l];document.body.dataset.carouselTheme=p.theme,Object.values(L).forEach(d=>{document.body.classList.remove(d.bodyClass)}),document.body.classList.add(p.bodyClass);const h=document.querySelector("#siteHeader");if(h&&(h.dataset.headerTheme=p.headerTheme),o.querySelectorAll(".carousel-mode-dock__btn").forEach(d=>{if(d.dataset.mode===l){d.classList.add("is-active");try{d.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})}catch{}}else d.classList.remove("is-active")}),l==="incline"){n.innerHTML=`
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
      `;const d=n.querySelector("#sliderWrapper"),u=n.querySelector("#sliderTrack"),m=n.querySelector("#sliderBadge");d&&u&&(t=new J({wrapper:d,track:u,badge:m,products:w,inclineAngle:10,onSelectProduct:e}))}else if(l==="liquid"){n.innerHTML=`
        <div class="webgl-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="webglMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#webglMount");t=new Z({container:d,products:w,onSelectProduct:e})}else if(l==="deck"){n.innerHTML=`
        <div class="deck-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.35; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="deckMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#deckMount");t=new Q({container:d,products:w,onSelectProduct:e})}else if(l==="activetheory"){n.innerHTML=`
        <div class="activetheory-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="atMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#atMount");t=new K({container:d,projects:R})}else if(l==="split"){n.innerHTML=`
        <div class="split-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="splitMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#splitMount");t=new tt({container:d,products:w,onSelectProduct:e})}else if(l==="orbital"){n.innerHTML=`
        <div class="orbital-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="orbitalMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#orbitalMount");t=new et({container:d,products:w,onSelectProduct:e})}else if(l==="a24"){n.innerHTML=`
        <div class="a24-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="a24Mount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#a24Mount");t=new it({container:d,products:w,onSelectProduct:e})}else if(l==="aristide"){n.innerHTML=`
        <div class="aristide-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="aristideMount" style="position:absolute; inset:0;"></div>
        </div>
      `;const d=n.querySelector("#aristideMount");t=new st({container:d,products:w,onSelectProduct:e})}};o.querySelectorAll(".carousel-mode-dock__btn").forEach(l=>{l.addEventListener("click",n=>{const p=n.currentTarget.dataset.mode||"incline";p!==i&&s(p)})});const a=["incline","liquid","deck","activetheory","split","orbital","a24","aristide"],r=window.location.hash.replace("#",""),c=a.includes(r)?r:"activetheory";return setTimeout(()=>{s(c)},0),o}function rt(){const o=document.createElement("div");return o.className="page-container",o.innerHTML=`
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
      `).join(""))}e(w),i.forEach(s=>{s.addEventListener("click",()=>{i.forEach(r=>r.classList.remove("active")),s.classList.add("active");const a=s.dataset.filter;e(a==="all"?w:w.filter(r=>r.category===a))})})},0),o}function nt(o){const t=document.createElement("div"),i=o.slug||"smeraldo",e=w.find(s=>s.slug===i)||w[0];return t.innerHTML=`
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
  `,setTimeout(()=>{const s=t.querySelector("#btnAddToCart");s?.addEventListener("click",()=>{s.textContent="Added! ✓",setTimeout(()=>s.textContent="Add to Cart",2e3)})},0),t}function E(o="produzione"){const t=document.createElement("div");t.className="page-container";const i={produzione:{eyebrow:"Tradition & Method • Sicily",title:"Our Production Method",desc:"From volcanic soil to glass jar: honoring natural seasonal rhythms and gentle low-temperature cooking in copper kettles."},"chi-siamo":{eyebrow:"Generations of Growers",title:"Our Story",desc:"Custodians of Mount Etna's biodiversity since 1892. Cultivating passion, ancestral roots, and pure Sicilian authenticity."},experience:{eyebrow:"Tours & Guided Tastings",title:"The Farm Experience",desc:"Stroll among our century-old citrus groves and discover the timeless secrets of artisanal Sicilian preserve making."}}[o];return t.innerHTML=`
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
  `,t}function ot(){const o=document.createElement("div");return o.className="page-container",o.innerHTML=`
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
  `,setTimeout(()=>{const t=o.querySelector("#contactForm");t?.addEventListener("submit",e=>{e.preventDefault();const s=t.querySelector(".btn-submit");s&&(s.textContent="Message Sent Successfully! ✓",s.style.backgroundColor="#2f743e",setTimeout(()=>{s.textContent="Send Message",s.style.backgroundColor="",t.reset()},3e3))});const i=o.querySelector("#sicilyClock");if(i){const e=()=>{const s=new Date;i.textContent=s.toLocaleTimeString("en-US",{timeZone:"Europe/Rome"})+" (Sicily, CET)"};e(),setInterval(e,1e3)}},0),o}document.addEventListener("DOMContentLoaded",()=>{const o=document.getElementById("viewMount");if(!o)return;const t=new j;new Y;const i=new G(o);i.register("/",()=>at(),"Agrumêa Farm — Artisanal Sicilian Experience"),i.register("/dispensa",()=>rt(),"The Botanical Pantry — Agrumêa Farm"),i.register("/dispensa/:slug",r=>nt(r),"Product Detail — Agrumêa Farm"),i.register("/produzione",()=>E("produzione"),"Heritage & Method — Agrumêa Farm"),i.register("/experience",()=>E("experience"),"Tastings & Visits — Agrumêa Farm"),i.register("/chi-siamo",()=>E("chi-siamo"),"Our Story — Generations of Passion"),i.register("/contatti",()=>ot(),"Contact & Estate — Agrumêa Farm"),i.handleCurrentRoute();const e=document.getElementById("siteMenuToggle"),s=document.querySelectorAll(".fp-nav__link"),a=()=>{document.body.classList.remove("is-nav-open");const r=document.getElementById("siteFullPageNav");r&&r.setAttribute("aria-hidden","true")};e&&e.addEventListener("click",()=>{const r=document.body.classList.toggle("is-nav-open"),c=document.getElementById("siteFullPageNav");c&&c.setAttribute("aria-hidden",(!r).toString())}),s.forEach(r=>{r.addEventListener("click",c=>{c.preventDefault(),a();const l=r.getAttribute("href")||"/";i.navigateTo(l),s.forEach(n=>n.classList.remove("is-active")),r.classList.add("is-active")})}),t.bindInteractive(document.querySelectorAll("a, button"),"EXPLORE"),t.bindInteractive(document.querySelectorAll(".site-menu-toggle"),"MENU"),t.bindInteractive(document.querySelectorAll(".site-header__brand"),"HOME"),t.bindInteractive(document.querySelectorAll(".jar-slider__item"),"PANTRY")});
