/**
 * Beyond Atlas - Core Application & Data Controller
 * NASA Space Apps Challenge
 */

/* Mobile Navigation Toggle */
window.toggleMobileNav = function () {
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('mobileNavToggle');
  if (!nav) return;
  const isOpen = nav.classList.toggle('mobile-open');
  if (btn) btn.innerHTML = isOpen ? '✕' : '☰';
};

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('mobile-open')) {
          nav.classList.remove('mobile-open');
          const btn = document.getElementById('mobileNavToggle');
          if (btn) btn.innerHTML = '☰';
        }
      });
    });
  }
});

/* ==========================================================================
   Part #5: script-5
   ========================================================================== */
let isAudioOn = false;
let availableVoices = [];

function loadSpeechVoices(){
    if(!('speechSynthesis' in window)) return;
    availableVoices = window.speechSynthesis.getVoices() || [];
}
if('speechSynthesis' in window){
    loadSpeechVoices();
    window.speechSynthesis.onvoiceschanged = loadSpeechVoices;
}

function preferredVoice(lang){
    const voices = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices();
    const exact = voices.find(v => v.lang === lang);
    if(exact) return exact;
    const base = lang.split('-')[0].toLowerCase();
    return voices.find(v => v.lang && v.lang.toLowerCase().startsWith(base));
}

function currentSpeechLang(){
    return document.getElementById('langSelect')?.value || 'en-US';
}

function toggleGlobalAudio() {
    isAudioOn = !isAudioOn;
    const btn = document.getElementById('audioToggleBtn');
    if (isAudioOn) {
        btn.innerText = "🔊 Voice: ON";
        btn.classList.add('on');
        speakText(currentSpeechLang().startsWith('bn') ? 'ভয়েস চালু হয়েছে। অ্যাস্ট্রোফোর্জে স্বাগতম।' : 'Voice is on. Welcome to BEYOND ATLAS.');
    } else {
        btn.innerText = "🔇 Voice: OFF";
        btn.classList.remove('on');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
}

function speakText(text) {
    if (!isAudioOn || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const lang = currentSpeechLang();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voice = preferredVoice(lang);
    if(voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

function listenModalContent() {
    if (!isAudioOn) {
        const btn=document.getElementById('audioToggleBtn');
        if(btn) btn.click();
        return;
    }
    const currentId = document.getElementById('hwModal')?.dataset?.currentHwId;
    const isBn = currentSpeechLang().startsWith('bn');
    const item = hardwareData.find(h => h.id === currentId);

    if (isBn && item && item.narrationBn) {
        speakText(item.narrationBn);
    } else {
        const title = document.getElementById('mTitle')?.innerText || '';
        const purpose = document.getElementById('mPurpose')?.innerText || '';
        speakText(`${title}. Operational Purpose: ${purpose}`);
    }
    const purposeEl = document.getElementById('mPurpose');
    if(purposeEl){ purposeEl.classList.add('highlight-text'); setTimeout(()=>purposeEl.classList.remove('highlight-text'),1500); }
}

function openEyesSpace(){
    const modal=document.getElementById('spaceEyesModal');
    const frame=document.getElementById('spaceEyesFrame');
    frame.src='https://eyes.nasa.gov/apps/solar-system/';
    modal.style.display='flex';
}
function closeEyesSpace(){
    const frame=document.getElementById('spaceEyesFrame');
    frame.src='about:blank';
    document.getElementById('spaceEyesModal').style.display='none';
}
function openRomanSpace(){
    const modal=document.getElementById('romanSpaceModal');
    modal.style.display='flex';
}
function closeRomanSpace(){
    document.getElementById('romanSpaceModal').style.display='none';
}
function openRomanEyes(){
    window.open('https://eyes.nasa.gov/apps/solar-system/','_blank','noopener,noreferrer');
}

const hardwareData = [
    {
        id: "apollo11-lrrr",
        photoQueries: ["Apollo 11 laser retroreflector", "Apollo 11 retroreflector"],
        name: "Apollo 11 Laser Ranging Retroreflector",
        target: "moon",
        year: "1969",
        mission: "Apollo 11",
        loc: "Sea of Tranquility (0.67408° N, 23.47297° E)",
        summary: "A passive optical experiment that lets scientists measure the Earth–Moon distance with extraordinary precision.",
        purpose: "Reflect ground lasers back to Earth to calculate lunar distance precisely with millimeter accuracy.",
        how: "Constructed with an aerospace-grade aluminum panel housing 100 precision quartz corner-cube prisms that bounce incoming light directly back to its exact source regardless of angle of incidence.",
        happened: "Fully operational today after over 5 decades of continuous exposure to harsh lunar vacuum and thermal extremes, continuously receiving laser pulses from global ranging facilities.",
        why: "Passive optical architecture requiring zero electrical power, designed for indefinite standalone deployment without battery maintenance.",
        science: "Proved conclusively that the Moon has a molten liquid outer core, confirmed Einstein's Theory of General Relativity with unprecedented precision, and mapped complex lunar orbital secular acceleration dynamics.",
        narrationBn: "অ্যাপোলো ১১ লেজার রেট্রোরিফ্লেক্টর। এটি ১৯৬৯ সালে চাঁদের প্রশান্তি সাগরে স্থাপিত ১০০টি কোয়ার্টজ প্রিজম বিশিষ্ট প্যাসিভ অপটিক্যাল যন্ত্র। কোনো ব্যাটারি বা বিদ্যুৎ ছাড়াই এটি পৃথিবী থেকে পাঠানো লেজার রশ্মি প্রতিফলিত করে চাঁদ ও পৃথিবীর দূরত্ব মিলিমিটার নির্ভুলতায় নির্ণয় করে এবং আজ ৫০ বছর পরেও সম্পূর্ণ সচল রয়েছে।"
    },
    {
        id: "apollo15-lrv",
        photoQueries: ["Apollo 15 Lunar Roving Vehicle", "Lunar Roving Vehicle Apollo 15"],
        name: "Lunar Roving Vehicle (LRV-1)",
        target: "moon",
        year: "1971",
        mission: "Apollo 15",
        loc: "Hadley-Apennine (26.1322° N, 3.6339° E)",
        summary: "The first Apollo lunar rover, built to extend astronauts’ travel range and geological exploration on the Moon.",
        purpose: "Provide astronaut surface transportation to vastly expand geological sample collection range across volcanic rilles.",
        how: "Built with a foldable 2219 aluminum alloy chassis, silver-zinc potassium hydroxide non-rechargeable batteries, independent solid-rotor wheel drive motors, and a T-bar steering controller.",
        happened: "Parked permanently at Hadley Base after successfully logging 27.9 kilometers across extremely rugged, boulder-strewn volcanic highlands.",
        why: "Ascent Module weight restrictions and strict payload capacity constraints on the lunar module descent stage mandated abandoning the vehicle.",
        science: "Revolutionized off-world rover engineering, establishing baseline parameters for thermal vacuum mobility, dust mitigation, and electric drive endurance in low gravity.",
        narrationBn: "লুনার রোভিং ভেহিকেল এলআরভি-১। ১৯৭১ সালে অ্যাপোলো ১৫ মিশনে ব্যবহৃত চাঁদের প্রথম চার চাকার বৈদ্যুতিক যান। এটি মহাকাশচারীদের ২৭.৯ কিলোমিটার পথ পাড়ি দিতে এবং হাডলি রিল ও আগ্নেয়গিরি এলাকায় মূল্যবান ভূতাত্ত্বিক নমুনা সংগ্রহ করতে সক্ষম করেছিল।"
    },
    {
        id: "ingenuity",
        photoQueries: ["Ingenuity Mars Helicopter", "NASA Ingenuity helicopter Mars"],
        fixedPhoto: "https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA23882.jpg",
        name: "Ingenuity Mars Helicopter",
        target: "mars",
        year: "2021",
        mission: "Mars 2020",
        loc: "Jezero Crater, Mars (18.4447° N, 77.4508° E)",
        summary: "A small autonomous helicopter that demonstrated powered, controlled flight on another planet for the first time.",
        purpose: "Demonstrate powered controlled atmospheric flight in the ultra-thin 1 percent Martian atmosphere.",
        how: "Dual counter-rotating carbon-fiber composite blades spinning at approximately 2,400 RPM powered by high-efficiency solar-recharged lithium-ion cells and autonomous inertial navigation.",
        happened: "Completed 72 historic flights over 3 Earth years before sustaining carbon-fiber rotor tip damage during a hard descent landing.",
        why: "Mission lifetime and mechanical stress limits exceeded by over 300 percent before hardware blade fracture permanently halted further aerial scouting hops.",
        science: "Proved definitively that powered planetary aerial reconnaissance is completely viable and highly effective on thin-atmosphere terrestrial worlds, opening new paradigms for planetary exploration.",
        narrationBn: "ইনজেনুইটি মার্স হেলিকপ্টার। ২০২১ সালে মঙ্গলের অতি পাতলা বায়ুমণ্ডলে প্রথম নিয়ন্ত্রিত ও চালিত উড্ডয়ন প্রদর্শনকারী রোবটিক ড্রোন। এটি জেজেরো ক্রেটারে ৭২টি ঐতিহাসিক ফ্লাইট সফলভাবে সম্পন্ন করে অন্য গ্রহে ড্রোন উড্ডয়নের নতুন যুগের সূচনা করেছে।"
    },
    {
        id: "skycrane",
        photoQueries: ["Curiosity sky crane", "Mars Science Laboratory descent stage"],
        fixedPhoto: "https://www.nasa.gov/wp-content/uploads/2024/08/2-ksc-2011-7087large.jpg?w=1024",
        name: "MSL Curiosity Sky Crane System",
        target: "mars",
        year: "2012",
        mission: "Mars Science Laboratory",
        loc: "Gale Crater, Mars (4.5895° S, 137.4417° E)",
        summary: "A rocket-powered descent stage that lowered Curiosity onto Mars, then flew away for a controlled crash.",
        purpose: "Lower the heavy 900kg Curiosity Rover gently and directly onto its wheels without dangerous rocket exhaust dust contamination.",
        how: "Fully autonomous descent stage equipped with throttleable hydrazine monopropellant rocket engines, radar altimeters, and high-strength nylon bridle lowering cables.",
        happened: "Executed a programmed controlled flyaway maneuver immediately after payload deployment, safely impacting the Martian surface 650 meters away from the rover.",
        why: "Single-use landing infrastructure designed deliberately to sacrifice itself upon payload touchdown release.",
        science: "Pioneered heavy-payload entry descent landing mechanics which laid the essential technical foundation utilized for subsequent massive Mars rover and hardware payloads.",
        narrationBn: "এমএসএল কিউরিওসিটি স্কাই ক্রেন সিস্টেম। ২০১২ সালে ৯০০ কেজি ওজনের কিউরিওসিটি রোভারকে ধূলিঝড় সৃষ্টি না করে নিরাপদভাবে রকেট থ্রাস্টারের সাহায্যে মঙ্গলের গেল ক্রেটারে নামিয়ে দেয় এবং স্বয়ংক্রিয়ভাবে ৬৫০ মিটার দূরে ক্র্যাশ ল্যান্ডিং করে।"
    },
    {
        id: "apollo17-lrv",
        photoQueries: ["Apollo 17 Lunar Roving Vehicle", "Apollo 17 lunar rover NASA"],
        name: "Lunar Roving Vehicle (LRV-3)",
        target: "moon",
        year: "1972",
        mission: "Apollo 17",
        loc: "Taurus-Littrow Valley, Moon",
        summary: "The final Apollo lunar rover, used to travel farther from the lunar module and collect geological samples.",
        purpose: "Extend astronaut mobility and support geological field exploration during Apollo 17.",
        how: "A lightweight electric rover with four independently driven wheels, steering, wire-mesh wheels, batteries, navigation equipment, and a foldable chassis.",
        happened: "Used by astronauts Eugene Cernan and Harrison Schmitt during Apollo 17 surface excursions and left at the landing site after the mission.",
        why: "The rover was designed as surface mobility hardware and was not intended to return to Earth with the lunar module ascent stage.",
        science: "Enabled longer traverses and helped astronauts investigate the Taurus-Littrow Valley, including sampling and field observations beyond walking range.",
        narrationBn: "অ্যাপোলো ১৭ লুনার রোভিং ভেহিকেল এলআরভি-৩। ১৯৭২ সালে টরাস-লিট্রো উপত্যকায় দীর্ঘ ৩৫ কিলোমিটার ভূতাত্ত্বিক পরিভ্রমণ করতে ও চাঁদের বিরল কমলা মাটির নমুনা সংগ্রহ করতে মহাকাশচারী ইউজিন সারনেন ও হ্যারিসন স্মিট এটি ব্যবহার করেছিলেন।"
    },
    {
        id: "apollo14-lr3",
        photoQueries: ["Apollo 14 laser ranging retroreflector", "Apollo 14 retroreflector NASA"],
        name: "Apollo 14 Laser Ranging Retroreflector",
        target: "moon",
        year: "1971",
        mission: "Apollo 14",
        loc: "Fra Mauro Highlands, Moon",
        summary: "A passive array of corner-cube reflectors installed on the Moon for precision laser-ranging experiments.",
        purpose: "Return laser pulses toward their source so scientists can precisely measure lunar distance and motion.",
        how: "A panel containing precision corner-cube reflectors uses optical geometry to send incoming laser light back toward the observing station.",
        happened: "Remains on the lunar surface and is part of the long-running lunar laser-ranging experiment.",
        why: "It is a passive scientific instrument intended to remain at the lunar site for long-term measurements.",
        science: "Supports measurements of lunar orbit, Earth-Moon dynamics, and tests of gravitational physics using extremely precise timing.",
        narrationBn: "অ্যাপোলো ১৪ লেজার রেঞ্জিং রেট্রোরিফ্লেক্টর। ১৯৭১ সালে ফ্রা মাওরো অঞ্চলে স্থাপিত প্যাসিভ লেজার রিফ্লেক্টর যা আইনস্টাইনের সাধারণ আপেক্ষিকতা তত্ত্ব এবং চাঁদের মহাকর্ষীয় কক্ষপথের সূক্ষ্ম পরিবর্তন পরিমাপে বিজ্ঞানীদের সাহায্য করে চলেছে।"
    },
    {
        id: "apollo11-eagle",
        photoQueries: ["Apollo 11 lunar module Eagle Moon", "Apollo 11 Lunar Module NASA"],
        name: "Apollo 11 Lunar Module Eagle",
        target: "moon",
        year: "1969",
        mission: "Apollo 11",
        loc: "Sea of Tranquility, Moon",
        summary: "The lunar module that carried astronauts from lunar orbit to the Moon's surface during the first crewed lunar landing.",
        purpose: "Provide the crewed descent and ascent vehicle for Apollo astronauts operating on the lunar surface.",
        how: "A two-stage spacecraft used a descent propulsion system for landing and an ascent stage for returning the astronauts to lunar orbit.",
        happened: "The descent stage remains at the Apollo 11 landing site while the ascent stage departed the Moon.",
        why: "Only the ascent stage was required for the return to lunar orbit; the descent stage was left on the Moon as part of the mission architecture.",
        science: "The vehicle enabled the first human lunar surface operations and deployment of early Apollo scientific experiments.",
        narrationBn: "অ্যাপোলো ১১ লুনার মডিউল ঈগল। ১৯৬৯ সালের ২০ জুলাই নীল আর্মস্ট্রং এবং বাজ অলড্রিনকে নিয়ে চাঁদের বুকে প্রথম মানব অবতরণকারী ঐতিহাসিক মহাকাশযান। যার ডিসেন্ট স্টেজ আজ চাঁদের প্রশান্তি সাগরে মানব ইতিহাসের চিরন্তন নিদর্শন হিসেবে অবস্থান করছে।"
    },
    {
        id: "curiosity-rover",
        photoQueries: ["Curiosity rover Mars NASA", "Mars Science Laboratory Curiosity rover"],
        name: "Mars Science Laboratory Curiosity Rover",
        target: "mars",
        year: "2012",
        mission: "Mars Science Laboratory",
        loc: "Gale Crater, Mars (4.5895° S, 137.4417° E)",
        summary: "A car-sized mobile laboratory exploring Gale Crater to study Martian geology, climate, and past habitability.",
        purpose: "Analyze rocks and soil, investigate the environment, and assess whether Mars ever had conditions favorable for microbial life.",
        how: "Uses six-wheel rocker-bogie mobility, a robotic arm, drill and sample-handling hardware, cameras, spectrometers, and a radioisotope power system.",
        happened: "Landed in Gale Crater in August 2012 and continues surface science operations with its mission extended through NASA programs.",
        why: "Curiosity is a surface science rover designed for long-duration operation on Mars rather than return to Earth.",
        science: "Its measurements have documented ancient aqueous environments and helped reconstruct the geological and environmental history of Gale Crater.",
        narrationBn: "মার্স সায়েন্স ল্যাবরেটরি কিউরিওসিটি রোভার। ২০১২ সাল থেকে মঙ্গলের গেল ক্রেটারে সক্রিয়ভাবে গবেষণা চালিয়ে যাওয়া একটি গাড়ি-আকারের রোবট ল্যাবরেটরি, যা প্রাচীন মঙ্গলে অণুজীব বসবাসের উপযোগী জলীয় পরিবেশের চূড়ান্ত প্রমাণ আবিষ্কার করেছে।"
    },
    {
        id: "perseverance-rover",
        photoQueries: ["Perseverance rover Mars NASA", "Mars 2020 Perseverance rover"],
        name: "Perseverance Mars Rover",
        target: "mars",
        year: "2021",
        mission: "Mars 2020",
        loc: "Jezero Crater, Mars (18.4447° N, 77.4508° E)",
        summary: "A Mars rover built to search for signs of ancient microbial life and collect scientifically selected samples for possible future return.",
        purpose: "Study Jezero's ancient environments, characterize rocks and regolith, and cache samples for future missions.",
        how: "Combines six-wheel mobility with a robotic sampling system, advanced cameras, spectrometers, environmental sensors, and the PIXL and SHERLOC instruments.",
        happened: "Landed in Jezero Crater in February 2021 and has been conducting surface science and sample-caching operations.",
        why: "The rover is designed as a long-duration surface platform and remains on Mars after each mission activity.",
        science: "Provides detailed geological evidence from an ancient lake-and-delta environment and preserves samples intended to support future Mars exploration.",
        narrationBn: "পারসিভিয়ারেন্স মার্স রোভার। জেজেরো ক্রেটারে প্রাচীন লেক ও ব-দ্বীপের নমুনা সংগ্রহ করে ভবিষ্যৎ মার্স স্যাম্পল রিটার্ন মিশনের জন্য সুরক্ষিত টিউবে সংরক্ষণ করে চলেছে।"
    },
    {
        id: "insight-lander",
        photoQueries: ["NASA InSight lander Mars", "InSight Mars lander surface"],
        name: "InSight Mars Lander",
        target: "mars",
        year: "2018",
        mission: "InSight",
        loc: "Elysium Planitia, Mars (4.5024° N, 135.6234° E)",
        summary: "A stationary Mars lander built to study the planet's interior, seismic activity, and heat flow.",
        purpose: "Measure marsquakes, internal structure, and thermal properties to understand how rocky planets form and evolve.",
        how: "Used a sensitive seismometer, heat-flow experiment, pressure and weather sensors, and a robotic deployment arm on a stationary lander platform.",
        happened: "Operated on Mars from 2018 until its mission ended after solar-panel dust accumulation reduced available power.",
        why: "InSight was a stationary scientific platform intended to perform measurements at one carefully selected landing site.",
        science: "Returned the first comprehensive seismic observations from Mars and revealed new information about the planet's crust, mantle, and core.",
        narrationBn: "ইনসাইট মার্স ল্যান্ডার। ২০১৮ সালে এলিসিয়াম প্ল্যানিশিয়াতে অবতরণকারী সিসমিক স্টেশন যা মঙ্গলে ১,৩০০টিরও বেশি ভূমিকম্প বা মার্সকোয়েক রেকর্ড করে মঙ্গলের ভূত্বক ও তরল কোরের ভেতরের গঠন উন্মোচন করেছে।"
    }
];

const hardwareStatus = {
    "apollo11-lrrr": {status:"ACTIVE • PASSIVE", usable:"YES — laser ranging", cls:"passive", video:"fPCAfiGfv08", title:"Apollo 11 Moonwalk & Lunar Surface", desc:"See the Apollo 11 surface operation and understand the context in which the lunar instruments were deployed. The retroreflector itself is passive: it needs no battery or motor."},
    "apollo15-lrv": {status:"INACTIVE • HISTORICAL", usable:"NO — left on Moon", cls:"inactive", video:"J22hKd8SZp8", title:"Apollo 15: Lunar Rover in Action", desc:"Watch the Lunar Roving Vehicle extend astronaut mobility across the Moon. Focus on the four-wheel layout, steering and how the crew used it for geological exploration."},
    "apollo17-lrv": {status:"INACTIVE • HISTORICAL", usable:"NO — left on Moon", cls:"inactive", video:"FcSwFq3AAgA", title:"Apollo 17 Lunar Roving Vehicle", desc:"See the final Apollo lunar rover and how astronauts used electric mobility to travel farther from the lunar module."},
    "apollo14-lr3": {status:"ACTIVE • PASSIVE", usable:"YES — laser ranging", cls:"passive", video:"fPCAfiGfv08", title:"Apollo Lunar Surface Operations", desc:"Apollo surface footage provides context for the deployment of passive lunar experiments such as laser retroreflectors."},
    "apollo11-eagle": {status:"INACTIVE • HISTORICAL", usable:"NO — historic artifact", cls:"inactive", video:"fPCAfiGfv08", title:"Apollo 11 Lunar Module on the Moon", desc:"Historic Apollo 11 footage shows the lunar module, surface operations and the engineering environment around the landing site."},
    "curiosity-rover": {status:"ACTIVE MISSION", usable:"YES — science operations", cls:"active", video:"P4boyXQuUIw", title:"Mars Science Laboratory — Curiosity", desc:"NASA JPL's mission animation explains Curiosity's entry, descent, landing and rover architecture, including the sky-crane concept."},
    "perseverance-rover": {status:"ACTIVE MISSION", usable:"YES — science operations", cls:"active", video:"TgcI8ur72x0", title:"Perseverance & Ingenuity Arrive at Mars", desc:"See the Mars 2020 landing sequence and how Perseverance carried Ingenuity to Jezero Crater for its flight demonstration."},
    "ingenuity": {status:"MISSION COMPLETE", usable:"NO — flight ended", cls:"inactive", video:"wMnOo2zcjXA", title:"Ingenuity's First Powered Flight", desc:"Actual rover-camera footage shows Ingenuity's first powered, controlled flight on another planet on April 19, 2021."},
    "skycrane": {status:"MISSION COMPLETE", usable:"NO — single-use", cls:"inactive", video:"P4boyXQuUIw", title:"Curiosity Sky Crane Landing", desc:"This NASA JPL animation explains the powered descent and sky-crane architecture used to place Curiosity safely on Mars."},
    "insight-lander": {status:"MISSION COMPLETE", usable:"NO — mission ended", cls:"inactive", video:"P4boyXQuUIw", title:"Mars Landing & Surface Engineering", desc:"Use the video as a visual introduction to robotic Mars mission architecture and compare it with InSight's stationary science platform."}
};

const videoCollections = {
    moon: [
        {hw:"apollo11-lrrr", label:"Apollo 11", thumb:"https://i.ytimg.com/vi/fPCAfiGfv08/hqdefault.jpg"},
        {hw:"apollo15-lrv", label:"Apollo 15 LRV", thumb:"https://i.ytimg.com/vi/J22hKd8SZp8/hqdefault.jpg"},
        {hw:"apollo17-lrv", label:"Apollo 17 LRV", thumb:"https://i.ytimg.com/vi/FcSwFq3AAgA/hqdefault.jpg"}
    ],
    mars: [
        {hw:"curiosity-rover", label:"Curiosity / MSL", thumb:"https://i.ytimg.com/vi/P4boyXQuUIw/hqdefault.jpg"},
        {hw:"perseverance-rover", label:"Perseverance + Ingenuity", thumb:"https://i.ytimg.com/vi/TgcI8ur72x0/hqdefault.jpg"},
        {hw:"ingenuity", label:"Ingenuity Flight", thumb:"https://i.ytimg.com/vi/wMnOo2zcjXA/hqdefault.jpg"}
    ]
};

function getHardwareStatus(item){
    return hardwareStatus[item.id] || {status:"CUSTOM ENTRY", usable:"CHECK DETAILS", cls:"", video:null, title:item.name, desc:"No video is attached to this custom entry yet."};
}

function openHardwareVideo(id){
    const item=hardwareData.find(h=>h.id===id);
    const info=getHardwareStatus(item||{id});
    if(!info.video){
        openModal(id); return;
    }
    document.getElementById('videoModalTitle').innerText=info.title || item.name;
    document.getElementById('videoModalSub').innerText=`${item ? item.name : 'NASA HARDWARE'} • ${item ? item.target.toUpperCase() : 'SPACE'} VIDEO`;
    document.getElementById('videoModalDescription').innerText=info.desc;
    const frame=document.getElementById('hardwareVideoFrame');
    frame.src=`https://www.youtube.com/embed/${info.video}?rel=0&modestbranding=1`;
    document.getElementById('hardwareVideoModal').style.display='flex';
}
function closeHardwareVideo(){
    const frame=document.getElementById('hardwareVideoFrame');
    frame.src='';
    document.getElementById('hardwareVideoModal').style.display='none';
}

function renderHardwareVideoZones(){
    ['moon','mars'].forEach(target=>{
        const grid=document.getElementById(target+'VideoGrid');
        if(!grid) return;
        grid.innerHTML=videoCollections[target].map(v=>{
            const item=hardwareData.find(h=>h.id===v.hw);
            if(!item) return '';
            const info=getHardwareStatus(item);
            return `<div class="hardware-video-card"><div class="video-thumb" style="background-image:url('${v.thumb}')" onclick="openHardwareVideo('${item.id}')"><div class="video-play">▶</div><div class="video-thumb-label">${v.label}</div></div><div class="video-card-body"><div class="video-card-title">${info.title}</div><div class="video-card-status">${info.status} • ${info.usable}</div><button class="btn btn-outline video-watch-btn" type="button" onclick="openHardwareVideo('${item.id}')">▶ See Video</button></div></div>`;
        }).join('');
    });
}

function renderCards(dataset, gridId) {
    const grid = document.getElementById(gridId);
    if(!grid) return;
    grid.innerHTML = dataset.map(item => `
        <div class="card-inline" data-hw-id="${item.id}" onclick="openModal('${item.id}')"><div class="hardware-photo-wrap"><div class="photo-loading" id="photo-${item.id}">LOADING REAL NASA PHOTO…</div><img class="hardware-photo" id="img-${item.id}" alt="${item.name}" style="display:none;"><div class="photo-shade"></div><div class="photo-badge">${item.target === 'moon' ? '🌕 MOON' : '🔴 MARS'} • ${item.year}</div><div class="photo-credit">NASA ARCHIVE</div></div><div class="card-content-side"><div class="card-sub">📅 ${item.year} | ${item.target.toUpperCase()} HARDWARE</div><div class="card-title">${item.name}</div><div class="hardware-simple-desc">${item.summary || item.purpose}</div><div class="hardware-status-row"><span class="hw-status-badge ${getHardwareStatus(item).cls}">${getHardwareStatus(item).status}</span><span class="hw-status-badge">${getHardwareStatus(item).usable}</span></div><button class="btn btn-outline detail-btn" type="button" onclick="event.stopPropagation(); openModal('${item.id}')">🔍 See Details</button><button class="btn btn-primary detail-btn" type="button" onclick="event.stopPropagation(); openHardwareVideo('${item.id}')">▶ See Video</button></div></div>
    `).join('');
    loadHardwarePhotos(dataset);
}

async function loadHardwarePhotos(dataset = hardwareData) {
    const usedUrls = new Set(Array.from(document.querySelectorAll('.hardware-photo')).map(img => img.src).filter(Boolean));
    for (const item of dataset) {
        const img = document.getElementById(`img-${item.id}`);
        const loading = document.getElementById(`photo-${item.id}`);
        if (!img || !loading) continue;
        try {
            if (item.fixedPhoto) {
                img.src = item.fixedPhoto;
                await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
                if (img.naturalWidth > 0) { loading.style.display='none'; img.style.display='block'; usedUrls.add(item.fixedPhoto); }
                else loading.innerHTML='NASA PHOTO UNAVAILABLE';
                continue;
            }
            const queries = item.photoQueries || [item.photoQuery || item.name];
            let chosenUrl = null;
            for (const query of queries) {
                const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=30`);
                const data = await res.json();
                const candidates = (data?.collection?.items || []).filter(x => x.links?.some(l => l.render === 'image' || l.href));
                if (!candidates.length) continue;
                const nameTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
                candidates.sort((a,b) => {
                    const score = x => {
                        const title = String(x.data?.[0]?.title || '').toLowerCase();
                        const desc = String(x.data?.[0]?.description || '').toLowerCase();
                        return nameTokens.reduce((n,w)=>n+(title.includes(w)?4:0)+(desc.includes(w)?1:0),0);
                    };
                    return score(b)-score(a);
                });
                const fresh = candidates.find(x => {
                    const l=x.links?.find(v=>v.render==='image')||x.links?.[0];
                    return l?.href && !usedUrls.has(l.href);
                });
                const any = candidates.find(x => (x.links?.find(v=>v.render==='image')||x.links?.[0])?.href);
                const chosen = fresh || any;
                const link = chosen?.links?.find(l=>l.render==='image') || chosen?.links?.[0];
                if (link?.href) { chosenUrl=link.href; break; }
            }
            if (chosenUrl) {
                img.src=chosenUrl;
                await new Promise(resolve => { img.onload=resolve; img.onerror=resolve; });
                if (img.naturalWidth > 0) { loading.style.display='none'; img.style.display='block'; usedUrls.add(chosenUrl); }
                else loading.innerHTML='NASA PHOTO UNAVAILABLE';
            } else loading.innerHTML='NASA PHOTO NOT FOUND';
        } catch (err) { loading.innerHTML='NASA PHOTO OFFLINE'; }
    }
}

function renderHardwareGallery() {
    const grid = document.getElementById('hardwareGalleryGrid');
    if (!grid) return;
    grid.innerHTML = hardwareData.map(item => `
        <div class="gallery-hw-card" onclick="openModal('${item.id}')">
            ${item.custom ? `<button class="gallery-delete-btn" type="button" onclick="event.stopPropagation(); deleteCustomHardware('${item.id}')">🗑 Remove</button>` : ''}
            <div id="gallery-photo-${item.id}" class="gallery-hw-loading">LOADING PHOTO…</div><img id="gallery-img-${item.id}" class="gallery-hw-photo" alt="${item.name}" style="display:none;" /><div class="gallery-hw-body"><div class="gallery-hw-tag">${item.target === 'moon' ? '🌕 MOON' : '🔴 MARS'} • ${item.year}</div><div class="gallery-hw-name">${item.name}</div><div class="gallery-hw-click">🔍 See Details</div></div></div>
    `).join('');

    hardwareData.forEach(async item => {
        const img = document.getElementById(`gallery-img-${item.id}`);
        const loading = document.getElementById(`gallery-photo-${item.id}`);
        if (!img || !loading) return;
        try {
            if (item.fixedPhoto) {
                img.src = item.fixedPhoto;
                img.onload = () => { loading.style.display='none'; img.style.display='block'; };
                img.onerror = () => { loading.innerText='PHOTO UNAVAILABLE'; };
                return;
            }
            const queries = item.photoQueries || [item.name];
            let chosen = null;
            for (const query of queries) {
                const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=12`);
                const data = await res.json();
                const items = data?.collection?.items || [];
                const candidates = items.filter(x => x.links?.some(l => l.render === 'image' || l.href));
                if (candidates.length) { chosen = candidates[0]; break; }
            }
            const link = chosen?.links?.find(l => l.render === 'image') || chosen?.links?.[0];
            if (link?.href) {
                img.src = link.href;
                img.onload = () => { loading.style.display='none'; img.style.display='block'; };
                img.onerror = () => { loading.innerText='PHOTO UNAVAILABLE'; };
            } else loading.innerText='PHOTO NOT FOUND';
        } catch(e) { loading.innerText='PHOTO OFFLINE'; }
    });
}

function saveCustomHardware() {
    const custom = hardwareData.filter(h => h.custom);
    try {
        localStorage.setItem('beyond-atlas_custom_hardware_v2', JSON.stringify(custom));
        return true;
    } catch (e) {
        alert('Storage is full. Please use a smaller image.');
        return false;
    }
}

function loadCustomHardware() {
    try {
        const saved = JSON.parse(localStorage.getItem('beyond-atlas_custom_hardware_v2') || '[]');
        if (!Array.isArray(saved)) return;
        saved.forEach(item => {
            if (item && item.id && item.custom && !hardwareData.some(h => h.id === item.id)) {
                hardwareData.push(item);
            }
        });
    } catch (e) {
        console.warn('Could not load saved custom hardware.', e);
    }
}

function deleteCustomHardware(id) {
    const item = hardwareData.find(h => h.id === id);
    if (!item || !item.custom) return;
    if (!confirm(`Delete "${item.name}" from your saved hardware gallery?`)) return;
    const index = hardwareData.findIndex(h => h.id === id);
    if (index >= 0) hardwareData.splice(index, 1);
    saveCustomHardware();
    initGrids();
    renderHardwareGallery();
    renderTimeline();
}

function compressUploadedImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const maxSide = 1000;
                const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.78));
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function openAddHardwareModal(){ document.getElementById('addHardwareModal').style.display='flex'; }
function closeAddHardwareModal(){ document.getElementById('addHardwareModal').style.display='none'; }

async function addCustomHardware(){
    const name = document.getElementById('addHwName').value.trim();
    const target = document.getElementById('addHwTarget').value;
    const year = document.getElementById('addHwYear').value.trim() || '—';
    const mission = document.getElementById('addHwMission').value.trim() || 'Custom Entry';
    const imageUrl = document.getElementById('addHwImage').value.trim();
    const imageFile = document.getElementById('addHwImageFile').files[0];
    const summary = document.getElementById('addHwSummary').value.trim() || 'Custom hardware entry added by the visitor.';

    if (!name) { alert('Please enter a hardware name.'); return; }
    if (!imageUrl && !imageFile) { alert('Please add a hardware photo URL or upload a photo.'); return; }

    let fixedPhoto = imageUrl || '';
    if (imageFile) {
        try {
            fixedPhoto = await compressUploadedImage(imageFile);
        } catch (e) {
            alert('Could not read that image. Please try another photo.');
            return;
        }
    }

    const id = 'custom-' + Date.now();
    hardwareData.push({
        id, custom:true, name, target, year, mission,
        loc: 'Custom entry — location not specified',
        summary,
        purpose: summary,
        how: 'Custom entry — engineering details not specified.',
        happened: 'Custom hardware entry saved in this browser.',
        why: 'Custom entry — reason left behind not specified.',
        science: 'Custom entry — scientific legacy not specified.',
        fixedPhoto,
        photoQueries: []
    });

    if (!saveCustomHardware()) {
        hardwareData.pop();
        return;
    }
    closeAddHardwareModal();
    ['addHwName','addHwYear','addHwMission','addHwImage','addHwSummary'].forEach(id => document.getElementById(id).value='');
    document.getElementById('addHwImageFile').value = '';
    initGrids();
    renderHardwareGallery();
    renderTimeline();
}

function initGrids() {
    if (!window.__customHardwareLoaded) { loadCustomHardware(); window.__customHardwareLoaded = true; }

    renderCards(hardwareData.filter(h => h.target === 'moon'), 'moonGrid');
    renderCards(hardwareData.filter(h => h.target === 'mars'), 'marsGrid');
    renderCards(hardwareData, 'explorerGrid');
    renderHardwareVideoZones();
}

function filterHardware(type) {
    if (type === 'all') renderCards(hardwareData, 'explorerGrid');
    else renderCards(hardwareData.filter(h => h.target === type), 'explorerGrid');
}

function openSolarHardware(target){
    const section=document.getElementById(target);
    if(!section) return;
    section.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>showPlanetStep(target,2),450);
}

function initSolarSystem() {
    const box = document.getElementById('solarCanvas');
    if (!box) return;
    box.innerHTML = '';
    if (typeof THREE === 'undefined') {
        box.innerHTML = '<div class="solar-fallback">⚠️ 3D engine could not load.<br><small>Open BEYOND ATLAS with an internet connection and refresh.</small></div>';
        return;
    }

    const width=Math.max(box.clientWidth,320), height=Math.max(box.clientHeight,260);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,width/height,.1,100);
    camera.position.set(0,0,4.35);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
    renderer.setSize(width,height,false);
    renderer.domElement.style.width='100%';
    renderer.domElement.style.height='100%';
    renderer.domElement.style.display='block';
    renderer.domElement.style.touchAction='none';
    renderer.domElement.style.cursor='grab';
    box.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xb9c9df,.78));
    const sunlight=new THREE.DirectionalLight(0xffe0c7,2.25);
    sunlight.position.set(-3,2,5);
    scene.add(sunlight);
    const rim=new THREE.DirectionalLight(0x9d3924,.65);
    rim.position.set(3,-1,-3);
    scene.add(rim);

    // Subtle star field; Mars is the only celestial body in this view.
    const starGeo=new THREE.BufferGeometry(), starCount=520, starPos=new Float32Array(starCount*3);
    for(let i=0;i<starCount;i++){
        starPos[i*3]=(Math.random()-.5)*18;
        starPos[i*3+1]=(Math.random()-.5)*9;
        starPos[i*3+2]=-2-Math.random()*8;
    }
    starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
    scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xe7efff,size:.022,transparent:true,opacity:.82})));

    const marsMaterial=new THREE.MeshPhongMaterial({color:0xffffff,shininess:7,specular:0x3b1b14});
    const mars=new THREE.Mesh(new THREE.SphereGeometry(1.42,96,96),marsMaterial);
    scene.add(mars);

    const loader=new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load('https://threejs.org/examples/textures/planets/mars_1k_color.jpg',texture=>{
        if('colorSpace' in texture) texture.colorSpace=THREE.SRGBColorSpace;
        else texture.encoding=THREE.sRGBEncoding;
        texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
        marsMaterial.map=texture;
        marsMaterial.needsUpdate=true;
    },undefined,()=>{});

    const atmosphere=new THREE.Mesh(
        new THREE.SphereGeometry(1.46,64,64),
        new THREE.MeshBasicMaterial({color:0xd66a42,transparent:true,opacity:.055,side:THREE.BackSide})
    );
    scene.add(atmosphere);

    let dragging=false,lastX=0,lastY=0,autoRotate=true;
    const canvas=renderer.domElement;
    canvas.addEventListener('pointerdown',e=>{
        dragging=true;lastX=e.clientX;lastY=e.clientY;
        canvas.style.cursor='grabbing';
        try{canvas.setPointerCapture(e.pointerId);}catch(_){}
    });
    canvas.addEventListener('pointermove',e=>{
        if(!dragging)return;
        const dx=e.clientX-lastX,dy=e.clientY-lastY;
        lastX=e.clientX;lastY=e.clientY;
        mars.rotation.y+=dx*.008;
        mars.rotation.x=Math.max(-1.1,Math.min(1.1,mars.rotation.x+dy*.008));
    });
    const stopDrag=()=>{dragging=false;canvas.style.cursor='grab';};
    canvas.addEventListener('pointerup',stopDrag);
    canvas.addEventListener('pointercancel',stopDrag);
    canvas.addEventListener('lostpointercapture',stopDrag);

    // Mouse wheel / trackpad and pinch-friendly pointer gestures adjust the view size.
    let zoom=4.35;
    canvas.addEventListener('wheel',e=>{
        e.preventDefault();
        zoom=Math.max(2.8,Math.min(7,zoom+e.deltaY*.004));
        camera.position.z=zoom;
    },{passive:false});

    let previous=0;
    function animate(now){
        requestAnimationFrame(animate);
        const dt=Math.min((now-previous)/1000||0,.05);previous=now;
        if(!document.hidden){
            if(autoRotate&&!dragging)mars.rotation.y+=.18*dt;
            renderer.render(scene,camera);
        }
    }
    requestAnimationFrame(animate);

    const resize=()=>{
        const w=Math.max(box.clientWidth,280),h=Math.max(box.clientHeight,240);
        camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
    };
    if(window.ResizeObserver){
        const observer=new ResizeObserver(resize);observer.observe(box);
    } else window.addEventListener('resize',resize);
    setTimeout(resize,120);
}

function initMiniSpinners() {
    if(typeof THREE === 'undefined') return;
    const moonBox = document.getElementById('miniMoonCanvas');
    if(moonBox) {
        moonBox.innerHTML = '';
        const mScene = new THREE.Scene();
        const mCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        const mRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        mRenderer.setSize(110, 110);
        moonBox.appendChild(mRenderer.domElement);
        mScene.add(new THREE.AmbientLight(0xffffff, 1.4));
        const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32), new THREE.MeshPhongMaterial({ color: 0xd1d5db, emissive: 0x4b5563, emissiveIntensity: 0.3, shininess: 30 }));
        mScene.add(moonMesh);
        mCamera.position.z = 4;
        function animMoon() {
            requestAnimationFrame(animMoon);
            moonMesh.rotation.y += 0.012;
            mRenderer.render(mScene, mCamera);
        }
        animMoon();
    }

    const marsBox = document.getElementById('miniMarsCanvas');
    if(marsBox) {
        marsBox.innerHTML = '';
        const marScene = new THREE.Scene();
        const marCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        const marRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        marRenderer.setSize(110, 110);
        marsBox.appendChild(marRenderer.domElement);
        marScene.add(new THREE.AmbientLight(0xffffff, 1.4));
        const marsMesh = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32), new THREE.MeshPhongMaterial({ color: 0xf97316, emissive: 0x991b1b, emissiveIntensity: 0.3, shininess: 20 }));
        marScene.add(marsMesh);
        marCamera.position.z = 4;
        function animMars() {
            requestAnimationFrame(animMars);
            marsMesh.rotation.y += 0.012;
            marRenderer.render(marScene, marCamera);
        }
        animMars();
    }
}

let hw360Angle=0, hw360Dragging=false, hw360LastX=0;
function openFeaturedHardware(id){ openModal(id); }
function paintHardwareRotation(){
 const img=document.getElementById('hw360Image'); const slider=document.getElementById('hw360Slider');
 if(img) img.style.transform=`perspective(900px) rotateY(${hw360Angle}deg) rotateX(2deg) scale(${1+Math.min(Math.abs(hw360Angle),180)/180*0.025})`;
 if(slider) slider.value=hw360Angle;
}
function rotateHardwareView(delta){hw360Angle=Math.max(-180,Math.min(180,hw360Angle+delta));paintHardwareRotation();}
function resetHardwareView(){hw360Angle=0;paintHardwareRotation();}
(function setupHardwareDrag(){
 const stage=document.getElementById('hw360Stage'); if(!stage)return;
 stage.addEventListener('pointerdown',e=>{hw360Dragging=true;hw360LastX=e.clientX;stage.setPointerCapture(e.pointerId);});
 stage.addEventListener('pointermove',e=>{if(!hw360Dragging)return;const dx=e.clientX-hw360LastX;hw360LastX=e.clientX;hw360Angle=Math.max(-180,Math.min(180,hw360Angle+dx*.65));paintHardwareRotation();});
 const stop=()=>{hw360Dragging=false;};stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
})();

async function openModal(id) {
    const item = hardwareData.find(h => h.id === id) || hardwareData[0];
    const modalEl = document.getElementById('hwModal');
    if (modalEl) modalEl.dataset.currentHwId = item.id;
    document.getElementById('mTitle').innerText = item.name;
    document.getElementById('mSub').innerText = `${item.target.toUpperCase()} HARDWARE | ${item.mission} • ${item.year}`;
    document.querySelector('#mOverview span').innerText = item.summary || item.purpose;
    document.getElementById('mMission').innerText = `${item.mission} (${item.year})`;
    document.getElementById('mLoc').innerText = item.loc;
    document.getElementById('mPurpose').innerText = item.purpose;
    document.getElementById('mHow').innerText = item.how;
    document.getElementById('mHappened').innerText = item.happened;
    document.getElementById('mWhy').innerText = item.why;
    document.getElementById('mScience').innerText = item.science;
    const statusInfo=getHardwareStatus(item);
    document.getElementById('mStatus').innerText=statusInfo.status;
    document.getElementById('mUsable').innerText=statusInfo.usable;
    document.getElementById('modalVideoBtn').onclick=()=>openHardwareVideo(item.id);
    document.getElementById('modalVideoBtn').style.display=statusInfo.video ? 'inline-flex' : 'none';

    const modalPhotoWrap = document.getElementById('modalPhotoWrap');
    const modalPhoto = document.getElementById('modalHardwarePhoto');
    const sourceImg = document.getElementById(`img-${item.id}`);
    modalPhotoWrap.style.display = 'block';
    modalPhoto.removeAttribute('src');
    modalPhoto.alt = item.name;
    modalPhotoWrap.querySelector('.modal-photo-credit').textContent = 'NASA ARCHIVE • REAL HARDWARE PHOTO • LOADING…';
    await loadHardwarePhotos([item]);
    const refreshedImg = document.getElementById(`img-${item.id}`);
    const photoSrc = item.fixedPhoto || (refreshedImg && refreshedImg.src ? refreshedImg.src : '');
    if (photoSrc && photoSrc !== location.href) {
        modalPhoto.src = photoSrc;
        modalPhoto.onload = () => { modalPhotoWrap.querySelector('.modal-photo-credit').textContent = 'NASA ARCHIVE • REAL HARDWARE PHOTO'; };
        modalPhoto.onerror = () => { modalPhotoWrap.querySelector('.modal-photo-credit').textContent = 'NASA PHOTO UNAVAILABLE'; };
    } else {
        modalPhotoWrap.style.display = 'none';
    }

    document.getElementById('modalLiveSearchBtn').onclick = () => {
        closeModal();
        document.getElementById('nasaQuery').value = item.name;
        document.location.hash = '#archive';
        searchNASA();
    };

    hw360Angle=0;
    const spinImage=document.getElementById('hw360Image');
    if(spinImage){spinImage.src=item.fixedPhoto || (refreshedImg && refreshedImg.src ? refreshedImg.src : '');spinImage.alt=item.name+' interactive inspection';}
    paintHardwareRotation();
    document.getElementById('hw360Panel').style.display=(item.fixedPhoto || (refreshedImg && refreshedImg.src))?'block':'none';
    document.getElementById('hwModal').style.display = 'flex';
    speakText(`Inspecting ${item.name}. ${item.purpose}`);
}

function openTeamModal() { document.getElementById('teamModal').style.display = 'flex'; }
function closeTeamModal() { document.getElementById('teamModal').style.display = 'none'; }
function closeModal() { document.getElementById('hwModal').style.display = 'none'; }
window.addEventListener('click', function(e){
    const missionModal=document.getElementById('missionTimelineModal');
    const videoModal=document.getElementById('hardwareVideoModal');
    if(e.target===missionModal) closeMissionTimeline();
    if(e.target===videoModal) closeHardwareVideo();
});


function openGoogleSearch() {
    const query = document.getElementById('nasaQuery').value || 'NASA space hardware relics';
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
}


const planetFlow = {
  moon: {
    icon:'🌕', title:'The Moon',
    overview:'Human missions left scientific instruments and mobility hardware across the lunar surface. Start with the mission story, then open individual hardware.',
    how:'Apollo-era lunar hardware had to survive vacuum, extreme temperature swings, low gravity and strict mass limits. Passive instruments such as retroreflectors need no power, while the Lunar Roving Vehicle used electric drive and steering.',
    note:'Tip for students: open Hardware first, then See Video to connect the engineering design with real mission footage.',
    hardware:['apollo11-lrrr','apollo15-lrv','apollo17-lrv','apollo14-lr3','apollo11-eagle'],
    videos:['apollo11-lrrr','apollo15-lrv','apollo17-lrv']
  },
  mars: {
    icon:'🔴', title:'Mars',
    overview:'Mars exploration combines autonomous rovers, landing systems and experimental aircraft. Explore the hardware in small steps instead of reading everything at once.',
    how:'Mars hardware must operate with communication delay, dusty terrain, low temperatures and a thin atmosphere. Rovers use autonomous systems for navigation and science, while Ingenuity demonstrated powered flight in the Martian atmosphere.',
    note:'Tip for students: compare the rover, sky-crane and helicopter to see three very different engineering solutions for Mars.',
    hardware:['curiosity-rover','perseverance-rover','ingenuity','skycrane','insight-lander'],
    videos:['curiosity-rover','perseverance-rover','ingenuity']
  }
};

function flowItem(id){ return hardwareData.find(h=>h.id===id); }
async function loadPlanetIntroPhotos(target){
  const box=document.getElementById(target+'IntroPhotos'); if(!box)return;
  const imgs=[...box.querySelectorAll('img[data-planet-photo]')];
  for(const img of imgs){
    const h=flowItem(img.dataset.planetPhoto); if(!h)continue;
    if(h.fixedPhoto){ img.src=h.fixedPhoto; img.onerror=()=>fetchPlanetPhoto(img,h); } else { await fetchPlanetPhoto(img,h); }
  }
}
async function fetchPlanetPhoto(img,h){
  try{ const q=(h.photoQueries||[h.name])[0]; const r=await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=8`); const d=await r.json(); const item=d?.collection?.items?.find(v=>v.links?.some(l=>l.render==='image'||l.href)); const link=item?.links?.find(v=>v.render==='image')||item?.links?.[0]; if(link?.href){img.src=link.href;return;} }catch(e){}
  img.src='https://images-assets.nasa.gov/image/PIA23882/PIA23882~orig.jpg';
}

function showPlanetStep(target,step){
  const cfg=planetFlow[target], box=document.getElementById(target+'FlowContent'), tabs=document.querySelectorAll('#'+target+'Tabs .progressive-tab');
  if(!cfg||!box)return;
  tabs.forEach((b,i)=>b.classList.toggle('active',i===step-1));
  if(step===1){
    const photoIds=cfg.hardware;
    box.innerHTML=`<div class="progressive-intro"><div><h3>${cfg.icon} ${cfg.title} — Start Here</h3><p>${cfg.overview}</p><div class="progressive-next"><button class="btn btn-primary" onclick="showPlanetStep('${target}',2)">Next: Hardware →</button><button class="btn btn-outline" onclick="showPlanetStep('${target}',4)">▶ Jump to Video</button></div></div><div class="progressive-big-icon">${cfg.icon}</div></div><div class="planet-photo-strip" id="${target}IntroPhotos">${photoIds.map(id=>{const h=flowItem(id);return `<div class="planet-photo-card"><span class="planet-photo-tag">NASA HARDWARE</span><img data-planet-photo="${id}" src="${h?.fixedPhoto||''}" alt="${h?.name||'NASA hardware'}"><div class="planet-photo-caption">${h?.name||''}</div></div>`}).join('')}</div>`;
    loadPlanetIntroPhotos(target);
  } else if(step===2){
    const cards=cfg.hardware.map(id=>{const h=flowItem(id);if(!h)return '';const st=getHardwareStatus(h);return `<div class="flow-hw-card"><div class="flow-hw-icon">${target==='moon'?'🛰️':'🤖'}</div><div class="flow-hw-year">${h.year} • ${h.mission}</div><h4>${h.name}</h4><p>${h.summary}</p><div class="flow-hw-actions"><button class="btn btn-outline" onclick="openModal('${h.id}')">🔍 Details</button><button class="btn btn-primary" onclick="openHardwareVideo('${h.id}')">▶ Video</button></div></div>`}).join('');
    box.innerHTML=`<h3>🔧 Key Hardware</h3><p style="margin-bottom:13px;">Only a few important examples are shown here. Open <b>Details</b> for the engineering and <b>Video</b> for real mission footage.</p><div class="flow-hardware-grid">${cards}</div><div class="progressive-next"><button class="btn btn-primary" onclick="showPlanetStep('${target}',3)">Next: How It Works →</button></div>`;
  } else if(step===3){
    box.innerHTML=`<h3>⚙️ How the Hardware Works</h3><div class="flow-note">${cfg.how}</div><div class="progressive-next"><button class="btn btn-primary" onclick="showPlanetStep('${target}',4)">Next: See Real Video →</button><button class="btn btn-outline" onclick="showPlanetStep('${target}',2)">← Back to Hardware</button></div>`;
  } else {
    const vids=cfg.videos.map(id=>{const h=flowItem(id), st=getHardwareStatus(h);if(!h||!st.video)return '';const vc=videoCollections[target].find(v=>v.hw===id);return `<div class="flow-video-card"><div class="flow-video-thumb" style="background-image:url('${vc?.thumb||''}')" onclick="openHardwareVideo('${id}')"></div><div class="flow-video-body"><h4>${h.name}</h4><p>${st.status} • ${st.usable}</p><button class="btn btn-primary" onclick="openHardwareVideo('${id}')">▶ See Video</button></div></div>`}).join('');
    box.innerHTML=`<h3>🎥 Real Mission Footage</h3><p style="margin-bottom:13px;">Click any video to watch it inside BEYOND ATLAS. Start with one — you can explore the others later.</p><div class="flow-video-grid">${vids}</div><div class="progressive-next"><button class="btn btn-outline" onclick="showPlanetStep('${target}',1)">↺ Start Again</button></div>`;
  }
}

async function openPlanetModal(target) {
    const cfg = planetFlow[target];
    const modalPhotoWrap = document.getElementById('modalPhotoWrap');
    const modalPhoto = document.getElementById('modalHardwarePhoto');
    const firstHardware = flowItem(cfg.hardware[0]);
    document.querySelector('#mOverview span').innerText = target === 'moon'
        ? 'Explore the historic lunar hardware represented in this section, including Apollo-era laser ranging and surface mobility systems.'
        : 'Explore the Mars hardware represented in this section, including powered flight and the sky-crane landing architecture.';
    modalPhotoWrap.style.display='block';
    modalPhoto.alt = firstHardware?.name || `${target} hardware`;
    modalPhoto.src = firstHardware?.fixedPhoto || explorerImage(firstHardware) || '';
    modalPhotoWrap.querySelector('.modal-photo-credit').textContent = 'NASA ARCHIVE • REAL HARDWARE PHOTO';
    if(firstHardware && !modalPhoto.src){ await loadHardwarePhotos([firstHardware]); }
    if(firstHardware && firstHardware.fixedPhoto){ modalPhoto.src = firstHardware.fixedPhoto; }
    modalPhoto.onerror = async () => { if(firstHardware){ await loadHardwarePhotos([firstHardware]); const img=document.getElementById(`img-${firstHardware.id}`); if(img?.src) modalPhoto.src=img.src; } };
    document.getElementById('mTitle').innerText = target === 'moon' ? 'Moon Exploration & Orbital Hub' : 'Mars Exploration & Surface Hub';
    document.getElementById('mSub').innerText = `${target.toUpperCase()} DEEP ARCHIVE & TELEMETRY HUB`;
    document.getElementById('mMission').innerText = target === 'moon' ? 'Multiple Lunar Landings (Apollo 11, 15)' : 'Mars 2020 & Curiosity Missions';
    document.getElementById('mLoc').innerText = target === 'moon' ? 'Lunar Surface Coordinates (Multi-site)' : 'Martian Crater Basins (Jezero & Gale)';
    document.getElementById('mPurpose').innerText = target === 'moon' ? 'Comprehensive lunar surface artifact tracking, laser ranging telemetry, and retroreflector arrays.' : 'Advanced Martian atmospheric flight demonstration, soil sampling, and heavy rover descent systems.';
    document.getElementById('mHow').innerText = target === 'moon' ? 'Utilizes passive quartz corner-cube optical prisms reflecting 532nm laser beams sent directly from Earth observatories.' : 'Employs autonomous rotorcraft aerodynamics, rocket-powered sky-cranes, and nuclear radioisotope thermoelectric power.';
    document.getElementById('mHappened').innerText = target === 'moon' ? 'All historical lunar retroreflectors and rovers remain fully preserved in ultra-low vacuum and zero moisture.' : 'Rovers and helicopters continue scientific monitoring or rest in stable dry dust sediment.';
    document.getElementById('mWhy').innerText = 'Mass constraints during lunar and martian ascent stages prevent return transport of heavy landing brackets and base structures.';
    document.getElementById('mScience').innerText = target === 'moon' ? 'Provides absolute millimeter-precision measurements of earth-moon gravitational recession and internal lunar core dynamics.' : 'Unlocks atmospheric physics of thin CO2 worlds and paves the way for safe crewed Martian colonization.';
    
    document.getElementById('hwModal').style.display = 'flex';
}

const missionTimelineData = [
    {
        year:"1969", target:"Moon", mission:"Apollo 11",
        title:"First Crewed Moon Landing",
        query:"Apollo 11 Moon landing",
        objective:"Land humans on the Moon, conduct surface exploration, deploy experiments and return safely to Earth.",
        key:"Launched July 16, 1969; lunar landing July 20, 1969; splashdown July 24, 1969."
    },
    {
        year:"1971", target:"Moon", mission:"Apollo 15",
        title:"First Apollo Lunar Rover Mission",
        query:"Apollo 15 Lunar Roving Vehicle",
        objective:"Explore the Hadley-Apennine region with greater surface mobility and conduct lunar science experiments.",
        key:"Launched July 26, 1971; first Apollo mission to use the Lunar Roving Vehicle."
    },
    {
        year:"1972", target:"Moon", mission:"Apollo 17",
        title:"Final Apollo Lunar Landing",
        query:"Apollo 17 Moon rover",
        objective:"Carry out the final Apollo lunar surface exploration and collect extensive geological samples.",
        key:"Launched December 7, 1972; final Apollo mission to land humans on the Moon."
    },
    {
        year:"2012", target:"Mars", mission:"Mars Science Laboratory",
        title:"Curiosity & Sky Crane Landing",
        query:"Curiosity rover sky crane Mars",
        objective:"Deliver the Curiosity rover safely to Gale Crater using the powered sky-crane landing architecture.",
        key:"Curiosity landed in Gale Crater on August 6, 2012."
    },
    {
        year:"2021", target:"Mars", mission:"Mars 2020",
        title:"Perseverance & Ingenuity",
        query:"Perseverance Ingenuity Mars",
        objective:"Search for signs of ancient life, collect samples, and demonstrate powered flight on another planet.",
        key:"Perseverance and Ingenuity landed in Jezero Crater in February 2021; Ingenuity's first powered flight was April 19, 2021."
    }
];

function missionFallbackImage(target){
    return target === "Moon"
        ? "https://images-assets.nasa.gov/image/AS11-40-5903/AS11-40-5903~orig.jpg"
        : "https://images-assets.nasa.gov/image/PIA26344/PIA26344~orig.jpg";
}

async function getMissionImage(query, target){
    try{
        const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=10`);
        const data = await res.json();
        const items = data.collection && data.collection.items ? data.collection.items : [];
        for(const item of items){
            const href = item.links && item.links[0] ? item.links[0].href : "";
            if(href && /^https?:\/\//i.test(href)) return href;
        }
    }catch(e){}
    return missionFallbackImage(target);
}

function openMissionTimeline(){
    const modal=document.getElementById('missionTimelineModal');
    const grid=document.getElementById('missionTimelineGrid');
    if(!modal || !grid) return;
    modal.style.display='flex';
    grid.innerHTML=missionTimelineData.map((m,i)=>`
        <article class="mission-card"><img id="missionImg${i}" src="${missionFallbackImage(m.target)}" alt="${m.mission} mission"><div class="mission-card-body"><div class="mission-year">📅 ${m.year} • ${m.target.toUpperCase()}</div><h3>${m.mission}</h3><p><strong>${m.title}</strong></p><p>${m.objective}</p><div class="mission-meta">🔎 ${m.key}</div></div></article>
    `).join('');
    missionTimelineData.forEach(async (m,i)=>{
        const img=await getMissionImage(m.query,m.target);
        const el=document.getElementById(`missionImg${i}`);
        if(el && img) el.src=img;
    });
}

function closeMissionTimeline(){
    const modal=document.getElementById('missionTimelineModal');
    if(modal) modal.style.display='none';
}

function renderTimeline() {
    /* Timeline is intentionally compact on the homepage.
       Full mission details are opened with See Mission Timeline & Details. */
}

setInterval(() => {
    const distEl = document.getElementById('voyagerDist');
    if (distEl) {
        let curr = parseInt(distEl.innerText.replace(/,/g, ''));
        distEl.innerText = (curr + 17).toLocaleString() + ' km';
    }
}, 1000);

let gameState = { target: '', payload: '', site: '' };
function selectGameOption(key, val, el) {
    gameState[key] = val;
    el.parentNode.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}
function nextGameStep(step) {
    if (step === 2 && !gameState.target) { alert('Choose the Moon or Mars first.'); return; }
    if (step === 3 && !gameState.payload) { alert('Choose one science instrument first.'); return; }
    document.querySelectorAll('#game .game-step').forEach(s => s.classList.remove('active'));
    const panel = document.getElementById(`gStep${step}`); if (panel) panel.classList.add('active');
    const labels = {1:'MISSION BRIEFING · 1 / 3',2:'HARDWARE SELECTION · 2 / 3',3:'LANDING PLAN · 3 / 3'};
    const label = document.getElementById('missionGameProgress'); if(label) label.textContent = labels[step] || 'MISSION REPORT';
    const bar = document.getElementById('missionGameBar'); if(bar) bar.style.width = (step*33.333)+'%';
}
function launchStudentMission() {
    if (!gameState.site) { alert('Choose a landing zone to continue.'); return; }
    const safe = gameState.site === 'Smooth open plain';
    const score = safe ? 95 : 62;
    document.querySelectorAll('#game .game-step').forEach(s => s.classList.remove('active'));
    document.getElementById('gStep4').classList.add('active');
    document.getElementById('missionGameProgress').textContent = 'MISSION REPORT · COMPLETE';
    document.getElementById('missionGameBar').style.width = '100%';
    document.getElementById('gameResultTitle').textContent = safe ? `🌟 Excellent planning, Commander!` : '⚠️ Mission completed with risk';
    document.getElementById('gameResultDesc').textContent = `Your ${gameState.target} mission carries a ${gameState.payload}. Landing choice: ${gameState.site}.`;
    document.getElementById('missionScore').textContent = `${score} / 100`;
    document.getElementById('missionDestination').textContent = gameState.target;
    document.getElementById('missionLearningNote').textContent = safe ? 'Engineering insight: flatter terrain generally reduces landing hazards and helps robotic vehicles move safely. Real missions also study terrain carefully before choosing a landing site.' : 'Engineering insight: steep, rocky terrain can increase landing and mobility risks. Real mission teams use orbital images and terrain data to find safer landing areas.';
}
function resetGame() {
    gameState = { target: '', payload: '', site: '' };
    document.querySelectorAll('#game .option-card').forEach(c => c.classList.remove('selected'));
    nextGameStep(1);
}

// 30 STEM Quiz Questions
const quizData = [
    { q: "1. What equipment left by Apollo 11 allows laser ranging measurements from Earth?", opts: ["Seismometer Dome", "Retroreflector Array", "Lunar Rover", "Solar Panel"], ans: 1 },
    { q: "2. How many corner-cube silica glass prisms are on Apollo 11's retroreflector?", opts: ["50", "100", "200", "500"], ans: 1 },
    { q: "3. What helicopter completed 72 operational flights on Mars?", opts: ["Curiosity", "Ingenuity", "Perseverance", "Opportunity"], ans: 1 },
    { q: "4. How is Curiosity lowered onto Mars' surface before the Sky Crane crashes?", opts: ["Airbags", "Parachute", "Nylon Tethers", "Magnetic Rails"], ans: 2 },
    { q: "5. Which Apollo mission introduced the Lunar Roving Vehicle (LRV-1)?", opts: ["Apollo 11", "Apollo 13", "Apollo 15", "Apollo 17"], ans: 2 },
    { q: "6. What is the primary material used for the Apollo 15 LRV chassis?", opts: ["Titanium Steel", "2219 Aluminum Alloy", "Carbon Fiber", "Lead Composite"], ans: 1 },
    { q: "7. In which Martian crater did Ingenuity and Perseverance land?", opts: ["Gale Crater", "Jezero Crater", "Gusev Crater", "Endeavour Crater"], ans: 1 },
    { q: "8. What gas primarily makes up the Martian atmosphere?", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: 2 },
    { q: "9. Approximately what percentage of Earth's atmospheric pressure is Mars' atmosphere?", opts: ["1%", "10%", "50%", "80%"], ans: 0 },
    { q: "10. What power source drives the Ingenuity Mars Helicopter?", opts: ["Nuclear RTG", "Solar-recharged Lithium-ion batteries", "Hydrogen Fuel Cells", "Thermal Plugs"], ans: 1 },
    { q: "11. What is the approximate speed of Ingenuity's counter-rotating blades?", opts: ["1,200 RPM", "2,400 RPM", "5,000 RPM", "800 RPM"], ans: 1 },
    { q: "12. Which spacecraft holds the record for furthest human-made object from Earth?", opts: ["Pioneer 10", "Voyager 1", "New Horizons", "Cassini"], ans: 1 },
    { q: "13. What landing mechanism did the Mars Science Laboratory use in 2012?", opts: ["Airbag Bounce", "Sky Crane System", "Direct Skids", "Hovercrafting"], ans: 1 },
    { q: "14. What is the main purpose of lunar laser retroreflectors?", opts: ["To communicate with aliens", "To measure Earth-Moon distance precisely", "To generate solar power", "To melt lunar ice"], ans: 1 },
    { q: "15. Which Apollo mission first landed humans on the Moon?", opts: ["Apollo 8", "Apollo 11", "Apollo 12", "Apollo 16"], ans: 1 },
    { q: "16. What is the name of the landing site of Apollo 11?", opts: ["Sea of Tranquility", "Ocean of Storms", "Sea of Serenity", "Crater Tycho"], ans: 0 },
    { q: "17. What type of mirrors are inside the Apollo laser retroreflectors?", opts: ["Concave glass", "Corner-cube quartz prisms", "Flat metallic sheets", "Convex silicon lenses"], ans: 1 },
    { q: "18. Why are old rovers and descent stages left behind on planetary bodies?", opts: ["They are radioactive", "Return weight and launch payload limits", "They melt over time", "International space laws ban returns"], ans: 1 },
    { q: "19. Which rover landed on Mars alongside the Sky Crane system in 2012?", opts: ["Spirit", "Opportunity", "Curiosity", "Sojourner"], ans: 2 },
    { q: "20. What chemical propellant powered the MSL descent stage rockets?", opts: ["Hydrazine", "Liquid Methane", "Kerosene", "Liquid Hydrogen"], ans: 0 },
    { q: "21. Approximately how far is the Moon from Earth on average?", opts: ["150,000 km", "384,400 km", "1,200,000 km", "42,000 km"], ans: 1 },
    { q: "22. Which space agency operated the Ingenuity helicopter?", opts: ["ESA", "NASA", "ISRO", "Roscosmos"], ans: 1 },
    { q: "23. How many total flights did Ingenuity complete before retirement?", opts: ["5 flights", "25 flights", "50 flights", "72 flights"], ans: 3 },
    { q: "24. What caused Ingenuity's eventual end of mission?", opts: ["Ran out of sunlight", "Rotor tip blade damage during landing", "Extreme core overheating", "Communication antenna failure"], ans: 1 },
    { q: "25. Which theory was tested with high precision using lunar retroreflectors?", opts: ["Quantum Entanglement", "General Theory of Relativity", "String Theory", "Plate Tectonics"], ans: 1 },
    { q: "26. What is the primary advantage of passive optical retroreflectors?", opts: ["They require zero electrical power", "They transmit voice data", "They move around autonomously", "They heat up the lunar soil"], ans: 0 },
    { q: "27. In what year did Apollo 15 land on the Moon?", opts: ["1969", "1971", "1972", "1975"], ans: 1 },
    { q: "28. What geological region was explored by Apollo 15?", opts: ["Hadley-Apennine volcanic rille", "Crater Copernicus", "Fra Mauro highlands", "South Pole-Aitken basin"], ans: 0 },
    { q: "29. What is the approximate weight of the Curiosity rover lowered by the sky crane?", opts: ["300 kg", "900 kg", "2,500 kg", "50 kg"], ans: 1 },
    { q: "30. What is the primary science goal of studying deep space and planetary relics?", opts: ["To preserve historical legacy and understand space engineering limits", "To mine gold on Mars", "To build space hotels", "To clean up space debris"], ans: 0 }
];

let qIdx = 0; let qScore = 0;
let qDisplayOptions = []; let qDisplayCorrect = 0;
function renderQuiz() {
    const q = quizData[qIdx];
    const qText = document.getElementById('qText');
    if(!qText) return;
    document.getElementById('qProgress').innerText = `Question ${qIdx + 1} of 30`;
    qText.innerText = q.q;
    // Shuffle A/B/C/D positions on every question while preserving the correct answer.
    qDisplayOptions = q.opts.map((text, originalIndex) => ({text, originalIndex}));
    for(let i=qDisplayOptions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qDisplayOptions[i],qDisplayOptions[j]]=[qDisplayOptions[j],qDisplayOptions[i]];}
    qDisplayCorrect = qDisplayOptions.findIndex(option => option.originalIndex === q.ans);
    const labels = ['A','B','C','D'];
    const optsBox = document.getElementById('qOptions');
    optsBox.innerHTML = qDisplayOptions.map((opt, i) => `
        <button class="quiz-opt" onclick="answerQuiz(${i})"><span class="quiz-choice-letter">${labels[i]}</span>${opt.text}</button>
    `).join('');
}
function playQuizWrongSound(){
    try{
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC) return;
        const ctx=new AC();
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.type='square'; osc.frequency.setValueAtTime(180,ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(95,ctx.currentTime+0.18);
        gain.gain.setValueAtTime(0.055,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.22);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.22);
        setTimeout(()=>ctx.close(),300);
    }catch(e){}
}
function answerQuiz(selected) {
    const q = quizData[qIdx];
    const feedback = document.getElementById('quizFeedback');
    const optionButtons = document.querySelectorAll('.quiz-opt');
    feedback.style.display = 'block';
    optionButtons.forEach((b,i)=>b.classList.remove('quiz-wrong-react'));
    if (selected === qDisplayCorrect) {
        qScore += 10;
        document.getElementById('qScore').innerText = qScore;
        feedback.innerHTML = "🎉✨ <strong>Correct!</strong> 🚀 Great job — you got it right!"; feedback.style.color = "var(--green)"; feedback.classList.add("quiz-correct-pop");
    } else {
        if(optionButtons[selected]) optionButtons[selected].classList.add('quiz-wrong-react');
        feedback.innerHTML = `❌ <strong>Wrong!</strong> Correct Answer: ${qDisplayOptions[qDisplayCorrect].text}`; feedback.style.color = "var(--red)";
        playQuizWrongSound();
    }
    setTimeout(() => {
        feedback.style.display = 'none';
        feedback.classList.remove('quiz-correct-pop');
        qIdx++;
        if (qIdx < quizData.length) renderQuiz();
        else {
            document.getElementById('qText').innerText = `🎉 Quiz Finished! Score: ${qScore}/300`;
            document.getElementById('qOptions').innerHTML = `<button class="btn btn-primary" onclick="resetQuiz()">🔄 Restart Quiz</button>`;
        }
    }, 1200);
}
function resetQuiz() { qIdx = 0; qScore = 0; document.getElementById('qScore').innerText = 0; renderQuiz(); }

async function searchNASA() {
    const box = document.getElementById('nasaResults');
    if (!box) return;
    const input = document.getElementById('nasaQuery');
    const query = (input && input.value) ? input.value : 'Apollo Retroreflector';
    box.innerHTML = '<p style="color:var(--neon-blue); text-align:center; grid-column:1/-1;">🔴 LIVE SEARCH ACTIVE: Fetching NASA Archives...</p>';

    const matchedInternal = hardwareData.filter(h => h.name.toLowerCase().includes(query.toLowerCase()) || h.purpose.toLowerCase().includes(query.toLowerCase()));
    let htmlContent = '';

    if (matchedInternal.length > 0) {
        htmlContent += matchedInternal.map(item => `
            <div class="card-inline" style="border-color:var(--purple);" onclick="openModal('${item.id}')"><div class="card-content-side"><div class="card-sub">PROJECT MATCH | ${item.target.toUpperCase()}</div><div class="card-title">${item.name}</div><div class="card-desc">${item.purpose}</div><button class="btn btn-outline" style="padding:8px 16px; font-size:11px; margin-top:6px;">🔍 Inspect Relic Details</button></div></div>
        `).join('');
    }

    try {
        const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`);
        const data = await res.json();
        const items = data.collection.items.slice(0, 4);

        if (items && items.length > 0) {
            htmlContent += items.map(item => {
                const title = item.data[0]?.title || 'NASA Space Hardware';
                const desc = item.data[0]?.description ? item.data[0].description.substring(0, 110) + '...' : 'NASA open repository item.';
                const date = item.data[0]?.date_created ? item.data[0].date_created.substring(0, 10) : 'Archive';
                const imgUrl = item.links && item.links[0] ? item.links[0].href : '';
                const nasaId = item.data[0]?.nasa_id || '';
                // Open the official NASA record page, not an internal modal or raw image.
                const originalUrl = nasaId
                    ? `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`
                    : (item.href || 'https://images.nasa.gov/');

                return `
                    <a class="card-inline live-nasa-result-link"
                       href="${originalUrl}" target="_blank" rel="noopener noreferrer"
                       aria-label="Open original NASA record: ${title}">
                        ${imgUrl ? `<img style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:10px; border:1px solid var(--panel-border);" src="${imgUrl}" alt="${title}">` : ''}
                        <div class="card-content-side">
                          <div class="card-sub">📅 ${date} | LIVE NASA API</div>
                          <div class="card-title" style="font-size:15px;">${title}</div>
                          <div class="card-desc">${desc}</div>
                          <div class="live-result-open-original">Open original NASA information ↗</div>
                        </div>
                    </a>
                `;
            }).join('');
        }
        box.innerHTML = htmlContent || '<p style="color:var(--orange); text-align:center; grid-column:1/-1;">No live results found.</p>';
    } catch(e) {
        box.innerHTML = htmlContent || '<p style="color:var(--red); text-align:center; grid-column:1/-1;">Unable to connect to live NASA API.</p>';
    }
}

function openModalById(imgUrl, title) {
    document.getElementById('mTitle').innerText = title;
    document.getElementById('mSub').innerText = "NASA ARCHIVE REPOSITORY ITEM";
    document.getElementById('mMission').innerText = "Deep Space Historical Archival Record";
    document.getElementById('mLoc').innerText = "Extraterrestrial / Deep Space Coordinates";
    document.getElementById('mPurpose').innerText = "Preserve historical visual telemetry and documentation of human space exploration hardware.";
    document.getElementById('mHow').innerText = "Captured via optical and digital space telescopes or surface lander camera payloads.";
    document.getElementById('mHappened').innerText = "Archived permanently in official global space databases.";
    document.getElementById('mWhy').innerText = "Permanent record of space engineering milestones.";
    document.getElementById('mScience').innerText = "Inspires future generations of STEM researchers and aerospace engineers.";
    document.getElementById('hwModal').style.display = 'flex';
}


function explorerImage(h){
 const fixed={
  'ingenuity':'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA23882.jpg',
  'skycrane':'https://www.nasa.gov/wp-content/uploads/2024/08/2-ksc-2011-7087large.jpg?w=1024',
  'apollo15-lrv':'https://images-assets.nasa.gov/image/as15-88-11901/as15-88-11901~orig.jpg',
  'apollo11-lrrr':'https://images-assets.nasa.gov/image/AS11-40-5950/AS11-40-5950~orig.jpg'
 };
 return h.fixedPhoto||fixed[h.id]||'';
}
function showExplorerStep(step){
 const box=document.getElementById('explorerFlowContent'); if(!box) return;
 document.querySelectorAll('#explorerTabs .progressive-tab').forEach((b,i)=>b.classList.toggle('active',i===step-1));
 const moon=hardwareData.filter(h=>h.target==='moon'); const mars=hardwareData.filter(h=>h.target==='mars');
 if(step===1){box.innerHTML=`<div class="explorer-step-grid"><div class="explorer-choice-card" onclick="showExplorerStep(2);setExplorerFilter('moon')"><span class="big-icon">🌕</span><h3>MOON</h3><p>Apollo rovers, modules & science hardware</p></div><div class="explorer-choice-card" onclick="showExplorerStep(2);setExplorerFilter('mars')"><span class="big-icon">🔴</span><h3>MARS</h3><p>Rovers, helicopters & landing systems</p></div><div class="explorer-choice-card" onclick="showExplorerStep(2);setExplorerFilter('all')"><span class="big-icon">🛰️</span><h3>ALL HARDWARE</h3><p>Explore the complete collection</p></div></div>`; return;}
 const selected=window.__explorerFilter||'all'; const data=selected==='all'?hardwareData:selected==='moon'?moon:mars;
 if(step===2){box.innerHTML=`<div class="explorer-step-grid">${data.slice(0,6).map(h=>{const src=explorerImage(h); return `<div class="explorer-mini-card" data-hwid="${h.id}"><img src="${src}" alt="${h.name}" data-query="${(h.photoQueries||[h.name])[0].replace(/"/g,'&quot;')}" onerror="this.dataset.failed='1'"><div><h3>${h.name}</h3><p>${h.summary||h.purpose||'Space exploration hardware.'}</p><span class="hw-status-badge ${getHardwareStatus(h).cls}">${getHardwareStatus(h).status}</span></div></div>`;}).join('')}</div><div class="explorer-step-actions"><button class="btn btn-primary" onclick="showExplorerStep(3)">Next: How It Works →</button></div>`; loadExplorerImages(); return;}
 if(step===3){const h=(selected==='all'?hardwareData:data)[0]; const src=explorerImage(h); box.innerHTML=`<div class="explorer-mini-card"><img src="${src}" alt="${h.name}" data-query="${(h.photoQueries||[h.name])[0].replace(/"/g,'&quot;')}" onerror="this.dataset.failed='1'"><div><h3>${h.name}</h3><p><strong>How:</strong> ${h.how||h.purpose||'Designed to support planetary exploration.'}</p><p><strong>Why:</strong> ${h.why||'Built for a specific mission environment.'}</p></div></div><div class="explorer-step-actions"><button class="btn btn-primary" onclick="showExplorerStep(4)">Next: See Video →</button></div>`; loadExplorerImages(); return;}
 const h=(selected==='all'?hardwareData:data)[0]; const src=explorerImage(h); box.innerHTML=`<div class="explorer-mini-card"><img src="${src}" alt="${h.name}" data-query="${(h.photoQueries||[h.name])[0].replace(/"/g,'&quot;')}" onerror="this.dataset.failed='1'"><div><h3>${h.name}</h3><p>See the real hardware in action and understand its mission.</p><button class="btn btn-primary" onclick="openHardwareVideo('${h.id}')">▶ See Video</button></div></div>`; loadExplorerImages();
}
async function loadExplorerImages(){
 const imgs=document.querySelectorAll('#explorerFlowContent img[data-query]');
 for(const img of imgs){ if(img.src && !img.dataset.failed) continue; try{ const q=img.dataset.query; const r=await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=8`); const d=await r.json(); const x=d?.collection?.items?.find(v=>v.links?.some(l=>l.render==='image'||l.href)); const l=x?.links?.find(v=>v.render==='image')||x?.links?.[0]; if(l?.href){img.src=l.href; img.dataset.failed='';}}catch(e){} }
}

function setExplorerFilter(type){window.__explorerFilter=type;showExplorerStep(2);}


async function initOrbitHardwarePhotos(){
 const pairs=[['orbitMoonHw',hardwareData.find(h=>h.id==='apollo15-lrv')],['orbitMarsHw',hardwareData.find(h=>h.id==='ingenuity')]];
 for(const [id,item] of pairs){ const img=document.getElementById(id); if(!img||!item) continue; try{ const q=(item.photoQueries||[item.name])[0]; const r=await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=5`); const d=await r.json(); const x=d?.collection?.items?.find(v=>v.links?.some(l=>l.render==='image'||l.href)); const l=x?.links?.find(v=>v.render==='image')||x?.links?.[0]; if(l?.href) img.src=l.href; }catch(e){} }
}

function attachImageRecovery(){
    const fallbackSvg='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#06111f"/><text x="50%" y="46%" fill="#38bdf8" font-family="Arial" font-size="28" text-anchor="middle">NASA SPACE HARDWARE</text><text x="50%" y="57%" fill="#94a3b8" font-family="Arial" font-size="18" text-anchor="middle">Image unavailable — try Live NASA Archive</text></svg>');
    const bind=()=>document.querySelectorAll('img').forEach(img=>{
        if(img.dataset.recoveryBound) return;
        img.dataset.recoveryBound='1';
        img.addEventListener('error',async()=>{
            if(img.dataset.recoveryTried){img.src=fallbackSvg;return;}
            img.dataset.recoveryTried='1';
            const q=img.alt||img.dataset.query||'NASA space hardware';
            try{
                const r=await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=10`);
                const d=await r.json();
                const item=d?.collection?.items?.find(v=>v.links?.some(l=>l.render==='image'||l.href));
                const link=item?.links?.find(v=>v.render==='image')||item?.links?.[0];
                if(link?.href) img.src=link.href; else img.src=fallbackSvg;
            }catch(e){img.src=fallbackSvg;}
        },{once:false});
    });
    bind();
    if(!window.__imageRecoveryObserver){
        window.__imageRecoveryObserver=new MutationObserver(()=>bind());
        window.__imageRecoveryObserver.observe(document.body,{childList:true,subtree:true});
    }
}

window.onload = function() {
    showPlanetStep('moon', 1);
    showPlanetStep('mars', 1);
    initGrids();
    renderHardwareGallery();
    showExplorerStep(1);
    initSolarSystem();
    const orbitDetails = document.querySelector('.home-3d-drawer details');
    if (orbitDetails) orbitDetails.addEventListener('toggle', () => setTimeout(() => window.dispatchEvent(new Event('resize')), 50));
    // Decorative mini Three.js spinners disabled to keep the page responsive; NASA 3D viewers remain interactive.
    renderTimeline();
    renderQuiz();
    searchNASA();
    attachImageRecovery();
    initReal3DButtons();
};

window.toggleReal3DViewer = function(btn) {
  if (!btn) return;
  const card = btn.closest('.real3d-card') || btn.parentElement;
  if (!card) return;
  const stage = card.querySelector('.real3d-stage');
  if (!stage) return;
  const preview = stage.querySelector('.ba-planet-preview');
  const viewer = stage.querySelector('.ba-lazy-3d-viewer');
  const planet = btn.dataset.planet || 'moon';
  const isOpened = btn.dataset.opened === '1';

  if (isOpened) {
    if (viewer) {
      viewer.classList.remove('ba-viewer-open');
      viewer.style.setProperty('display', 'none', 'important');
    }
    if (preview) {
      preview.classList.remove('ba-preview-hidden');
      preview.style.setProperty('display', 'block', 'important');
    }
    btn.dataset.opened = '0';
    btn.innerHTML = planet === 'moon' ? '◇  Load Moon 3D View' : '◇  Load Mars 3D View';
  } else {
    if (preview) {
      preview.classList.add('ba-preview-hidden');
      preview.style.setProperty('display', 'none', 'important');
    }
    if (viewer) {
      viewer.classList.add('ba-viewer-open');
      viewer.style.setProperty('display', 'block', 'important');
      if (viewer.tagName && viewer.tagName.toLowerCase() === 'model-viewer') {
        viewer.setAttribute('reveal', 'auto');
        viewer.setAttribute('camera-controls', '');
        viewer.setAttribute('auto-rotate', '');
      } else if (viewer.tagName && viewer.tagName.toLowerCase() === 'iframe') {
        if (!viewer.src || viewer.src === 'about:blank') {
          viewer.src = 'https://mars.nasa.gov/gltf_embed/25042';
        }
      }
    }
    btn.dataset.opened = '1';
    btn.innerHTML = '↶  Show Photo';
  }
};

function initReal3DButtons() {
  document.querySelectorAll('.ba-load-3d-button').forEach(btn => {
    btn.onclick = function() { window.toggleReal3DViewer(this); };
  });
}
document.addEventListener('DOMContentLoaded', initReal3DButtons);

/* ==========================================================================
   Part #8: beyond-atlas-nasa-open-data
   ========================================================================== */
(async function(){
 const image=document.getElementById('nasaApodImage'),title=document.getElementById('nasaApodHeading'),text=document.getElementById('nasaApodText'),date=document.getElementById('nasaApodDate'),link=document.getElementById('nasaApodLink');
 if(!image||!title||!text)return;
 try{
   const response=await fetch('https://science.nasa.gov/wp-json/wp/v2/apod-basic/?count=1');
   if(!response.ok)throw new Error('NASA feed unavailable');
   const payload=await response.json();const d=Array.isArray(payload)?payload[0]:payload;
   const media=d?.media_type||d?.acf?.media_type||'image';
   const imgUrl=d?.hdurl||d?.image_url||d?.url||d?.acf?.url;
   const heading=d?.title||d?.acf?.title||'NASA Astronomy Picture of the Day';
   const explanation=d?.explanation||d?.acf?.explanation||d?.description||'Explore the original NASA page for the full scientific explanation.';
   const page=d?.permalink||d?.link||'https://science.nasa.gov/solar-system/';
   title.textContent=heading;date.textContent='NASA OPEN DATA'+(d?.date?' · '+d.date:'');
   text.textContent=explanation.length>540?explanation.slice(0,537).trim()+'…':explanation;
   link.href=page;link.textContent='Read NASA source ↗';
   if(media==='image'&&imgUrl){image.src=imgUrl;image.alt=d?.alt||heading;image.onerror=()=>{image.style.display='none';};}
   else {image.style.display='none';}
 }catch(e){date.textContent='NASA OPEN DATA';title.textContent='Explore NASA’s image archive';text.textContent='The daily feed could not be loaded right now. You can still explore real NASA photographs, mission images and videos in the public NASA Image and Video Library.';image.src='https://images-assets.nasa.gov/image/PIA12235/PIA12235~orig.jpg';link.href='https://images.nasa.gov/';}
})();

/* ==========================================================================
   Part #19: beyond-atlas-nasa-api-and-global-counter
   ========================================================================== */
(function(){
 // NASA Astronomy Picture of the Day: official NASA open-data endpoint (new WordPress API).
 const hero=document.querySelector('#hero .student-hero');
 fetch('https://science.nasa.gov/wp-json/wp/v2/apod-basic/')
  .then(r=>{if(!r.ok)throw new Error('NASA APOD unavailable');return r.json()})
  .then(data=>{const item=Array.isArray(data)?data[0]:data;if(!item)return;let url=item.url||item.image_url||item.image||item.hdurl;if(!url&&item.guid&&item.guid.rendered)url=item.guid.rendered;if(!url&&item.source_url)url=item.source_url;if(url&&/^https:\/\//i.test(url)){hero.style.backgroundImage='linear-gradient(105deg,rgba(2,8,20,.94),rgba(3,11,25,.80) 52%,rgba(3,9,20,.72)),url("'+url.replace(/["\\]/g,'')+'")';hero.style.backgroundSize='cover';hero.style.backgroundPosition='center';}})
  .catch(()=>console.info('NASA APOD image could not load; using the built-in space background.'));
 // Shared global visitor count: configure CounterAPI workspace/token below after creating a free workspace.
 const COUNTER_WORKSPACE='YOUR_COUNTERAPI_WORKSPACE';
 const COUNTER_TOKEN='YOUR_COUNTERAPI_TOKEN';
 const COUNTER_NAME='beyond-atlas-page-views';
 const output=document.getElementById('localVisitCount');
 async function globalViews(){
  if(!output)return;
  if(COUNTER_WORKSPACE.startsWith('YOUR_')||COUNTER_TOKEN.startsWith('YOUR_')){output.textContent='SETUP';output.title='Add CounterAPI workspace and token to enable shared worldwide views';return;}
  const headers={'Authorization':'Bearer '+COUNTER_TOKEN};
  try{
   const response=await fetch('https://api.counterapi.dev/v2/'+encodeURIComponent(COUNTER_WORKSPACE)+'/'+encodeURIComponent(COUNTER_NAME)+'/up',{headers});
   if(!response.ok)throw new Error('Counter service response '+response.status);
   const data=await response.json();const value=data.value??data.data??data.count??data.counter?.value;
   if(value!==undefined)output.textContent=Number(value).toLocaleString();else throw new Error('Counter value missing');
   const label=output.parentElement?.querySelector('small');if(label)label.textContent='worldwide · all devices';
  }catch(e){output.textContent='—';output.title='Global counter needs a valid CounterAPI setup';console.warn('Global visit counter setup required',e);}
 }
 globalViews();
})();

