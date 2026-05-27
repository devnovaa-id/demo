/**
 * ==============================================
 * FOR AUTHORIZED SECURITY TESTING ONLY.
 * USE ONLY ON SYSTEMS YOU OWN.
 * ==============================================
 */
;(function() {
    'use strict';

    // Completely wipe the page
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.title = '☠️ SYSTEM DESTROYED · HUNTER-X';

    // Font Awesome
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    fa.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
    fa.crossOrigin = 'anonymous';
    document.head.appendChild(fa);

    // Destructive styling
    const style = document.createElement('style');
    style.textContent = `
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            background: #000;
            overflow: hidden;
            height:100vh; width:100vw;
            font-family: 'Courier New', monospace;
            color:#ff0000;
            cursor:none;
            user-select:none;
        }

        /* Static noise overlay */
        .noise {
            position:fixed; top:0; left:0; right:0; bottom:0;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100" height="100" filter="url(%23n)" opacity="0.4"/></svg>');
            opacity:0.3;
            pointer-events:none;
            z-index:999;
            animation: noiseShift 0.1s infinite;
        }

        @keyframes noiseShift {
            0% { transform: translate(0,0); }
            25% { transform: translate(-2px,2px); }
            50% { transform: translate(2px,-1px); }
            75% { transform: translate(-1px,-2px); }
            100% { transform: translate(0,0); }
        }

        /* Shattered glass particles */
        .shard {
            position:absolute;
            background: rgba(255,0,0,0.3);
            border:1px solid rgba(255,0,0,0.7);
            backdrop-filter:blur(1px);
            animation: fall linear forwards;
            z-index:10;
            pointer-events:none;
        }
        @keyframes fall {
            0% { transform: translateY(-200%) rotate(0deg) scale(0.5); opacity:1; }
            80% { opacity:0.8; }
            100% { transform: translateY(110vh) rotate(720deg) scale(1.2); opacity:0; }
        }

        /* Crack lines */
        .crack {
            position:absolute;
            background:rgba(255,0,0,0.8);
            transform-origin:top left;
            animation: crackAppear 0.3s ease-out forwards;
            z-index:15;
            pointer-events:none;
            box-shadow: 0 0 6px red;
        }
        @keyframes crackAppear {
            from { transform: scale(0); opacity:0; }
            to { transform: scale(1); opacity:1; }
        }

        /* Main deface container (appears after destruction) */
        .deface-container {
            position:relative;
            z-index:50;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            height:100vh; text-align:center;
            animation: fadeIn 1.5s 1s both;
        }
        @keyframes fadeIn {
            from { opacity:0; transform:scale(0.8); }
            to { opacity:1; transform:scale(1); }
        }
        .glitch {
            animation: shake 0.15s infinite;
        }
        .logo i {
            font-size:5.5rem; color:#ff0000;
            filter:drop-shadow(0 0 40px red);
            margin:0 0.2em;
        }
        .tag {
            font-size:2rem; font-weight:bold;
            color:#ff3333; letter-spacing:0.4em;
            text-shadow:0 0 25px red; margin:0.5em 0;
        }
        .title {
            font-size:6rem; font-weight:900;
            text-transform:uppercase; letter-spacing:1.2em;
            text-shadow: 6px 6px 0 #000, -4px -4px 0 #aa0000, 0 0 40px red;
            animation: flicker 0.07s infinite alternate;
        }
        .subtitle {
            font-size:1.6rem; margin-top:2em;
            color:#aa0000; text-shadow:0 0 20px red;
        }
        .footer {
            position:absolute; bottom:2em; left:0; right:0;
            text-align:center; color:#550000; font-size:0.9rem;
            z-index:50;
        }
        @keyframes shake {
            0% { transform:translate(0); }
            25% { transform:translate(-7px,7px); }
            50% { transform:translate(7px,-5px); }
            75% { transform:translate(-5px,-7px); }
            100% { transform:translate(0); }
        }
        @keyframes flicker {
            0% { opacity:1; }
            50% { opacity:0.2; }
            100% { opacity:1; }
        }
    `;
    document.head.appendChild(style);

    // Noise layer
    const noise = document.createElement('div');
    noise.className = 'noise';
    document.body.appendChild(noise);

    // ========== DESTRUCTIVE EFFECTS ==========
    // 1. Generate falling shards (glass fragments)
    function spawnShards() {
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const shard = document.createElement('div');
                shard.className = 'shard';
                const size = Math.random() * 20 + 5;
                shard.style.width = size + 'px';
                shard.style.height = size * 1.8 + 'px';
                shard.style.left = Math.random() * 100 + '%';
                shard.style.top = -(Math.random() * 40 + 10) + 'px';
                shard.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                shard.style.animationDelay = Math.random() * 1 + 's';
                shard.style.transform = `rotate(${Math.random() * 180}deg)`;
                document.body.appendChild(shard);
                // Remove after animation
                setTimeout(() => shard.remove(), 4000);
            }, i * 15);
        }
    }

    // 2. Generate crack lines across the screen
    function spawnCracks() {
        const crackContainer = document.createElement('div');
        crackContainer.style.position = 'fixed';
        crackContainer.style.top = '0'; crackContainer.style.left = '0';
        crackContainer.style.width = '100%'; crackContainer.style.height = '100%';
        crackContainer.style.pointerEvents = 'none';
        crackContainer.style.zIndex = '20';
        document.body.appendChild(crackContainer);

        // Create several cracks radiating from center and random points
        for (let i = 0; i < 30; i++) {
            const crack = document.createElement('div');
            crack.className = 'crack';
            const length = Math.random() * 200 + 80;
            const thickness = Math.random() * 3 + 1;
            crack.style.height = thickness + 'px';
            crack.style.width = length + 'px';
            // Position: random center or near center
            const fromTop = 40 + Math.random() * 20; // % from top
            const fromLeft = 40 + Math.random() * 20; // % from left
            crack.style.top = fromTop + '%';
            crack.style.left = fromLeft + '%';
            const angle = Math.random() * 360;
            crack.style.transform = `rotate(${angle}deg)`;
            crack.style.animationDelay = Math.random() * 0.5 + 's';
            crackContainer.appendChild(crack);
        }
    }

    // 3. Play destructive audio
    function playDestructionSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Deep rumble and shatter
            const bufferSize = ctx.sampleRate * 1.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
            }
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = buffer;
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
            noiseSrc.connect(gainNode);
            gainNode.connect(ctx.destination);
            noiseSrc.start();

            // Metallic hit
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(250, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);
            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.3, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain2);
            gain2.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch(e) {}
    }

    // ========== LAUNCH DESTRUCTION ==========
    spawnShards();
    spawnCracks();
    playDestructionSound();

    // ========== DEFACE MESSAGE (appears after a short delay) ==========
    setTimeout(() => {
        const container = document.createElement('div');
        container.className = 'deface-container';

        const glitchWrap = document.createElement('div');
        glitchWrap.className = 'glitch';

        const logoDiv = document.createElement('div');
        logoDiv.className = 'logo';
        logoDiv.innerHTML = `
            <i class="fa-solid fa-skull"></i>
            <i class="fa-solid fa-biohazard"></i>
            <i class="fa-solid fa-radiation"></i>
            <i class="fa-solid fa-hand-fist"></i>
        `;

        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = 'AIRO HUNTER';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = 'HUNTER-X';

        const sub = document.createElement('div');
        sub.className = 'subtitle';
        sub.innerHTML = 'Everything has been shattered.<br>Your security was an illusion.';

        glitchWrap.appendChild(logoDiv);
        glitchWrap.appendChild(tag);
        glitchWrap.appendChild(title);
        glitchWrap.appendChild(sub);
        container.appendChild(glitchWrap);
        document.body.appendChild(container);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'footer';
        footer.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> No data stolen · Refresh to restore <i class="fa-solid fa-circle-exclamation"></i>';
        document.body.appendChild(footer);
    }, 900); // delay to let destruction effects play first

})();
