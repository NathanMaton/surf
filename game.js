const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game constants
const WATER_LEVEL = canvas.height * 0.6;
const GRAVITY = 0.2;
const BASE_WAVE_SPEED = 2;

// Difficulty parameters
const difficulty = {
    waveSpeed: BASE_WAVE_SPEED,
    waveAmplitude: 50,
    waveFrequency: 0.02,
    sweetSpotSize: 30,
    maxTilt: 0.3,
    windEffect: 0,
    turbulence: 0
};

// Game variables
const surfer = {
    x: canvas.width * 0.7,
    y: WATER_LEVEL - 50,
    width: 30,
    height: 50,
    speedX: 0,
    speedY: 0,
    angle: 0,
    onWave: false,
    balance: 0 // New balance mechanic
};

let score = 0;
let wavePhase = 0;

// Handle keyboard input
const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

function getWaveY(x, time) {
    // Add turbulence to wave
    const turbulence = Math.sin(x * 0.1 + time * 2) * difficulty.turbulence;
    const baseWave = Math.sin(x * difficulty.waveFrequency + time + turbulence) * difficulty.waveAmplitude;
    const waveEnvelope = Math.max(0, Math.min(1, (canvas.width - x) / (canvas.width * 0.5)));
    return WATER_LEVEL + baseWave * waveEnvelope;
}

function getWaveAngle(x, time) {
    const dx = 1;
    const y1 = getWaveY(x - dx, time);
    const y2 = getWaveY(x + dx, time);
    return Math.atan2(y2 - y1, 2 * dx);
}

function drawWave(time) {
    // Draw water
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(0, WATER_LEVEL, canvas.width, canvas.height - WATER_LEVEL);

    // Draw wave
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, WATER_LEVEL);

    for (let x = canvas.width; x >= 0; x -= 2) {
        const y = getWaveY(x, time);
        ctx.lineTo(x, y);
    }

    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    // Create gradient for wave
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4169E1');  // Wave color
    gradient.addColorStop(1, '#1E90FF');  // Water color
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw wave foam
    ctx.beginPath();
    for (let x = canvas.width; x >= 0; x -= 2) {
        const y = getWaveY(x, time);
        if (x === canvas.width) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawSurfer() {
    ctx.save();
    ctx.translate(surfer.x, surfer.y);
    ctx.rotate(surfer.angle + surfer.balance * 0.5);

    // Draw surfboard
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, surfer.width, surfer.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add surfboard detail
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-surfer.width + 5, 0);
    ctx.lineTo(surfer.width - 5, 0);
    ctx.stroke();

    // Draw surfer character
    const scale = surfer.height / 50; // Scale factor for pixel art
    
    // Draw legs (bent for surfing pose)
    ctx.fillStyle = '#1E90FF'; // Blue shorts
    ctx.beginPath();
    ctx.moveTo(-5 * scale, -15 * scale);
    ctx.quadraticCurveTo(-8 * scale, -10 * scale, -6 * scale, -5 * scale);
    ctx.lineTo(-2 * scale, -5 * scale);
    ctx.lineTo(0, -15 * scale);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(5 * scale, -15 * scale);
    ctx.quadraticCurveTo(8 * scale, -10 * scale, 6 * scale, -5 * scale);
    ctx.lineTo(2 * scale, -5 * scale);
    ctx.lineTo(0, -15 * scale);
    ctx.fill();

    // Draw torso
    ctx.fillStyle = '#FF6B6B'; // Red rashguard
    ctx.beginPath();
    ctx.moveTo(-6 * scale, -30 * scale);
    ctx.lineTo(6 * scale, -30 * scale);
    ctx.lineTo(4 * scale, -15 * scale);
    ctx.lineTo(-4 * scale, -15 * scale);
    ctx.closePath();
    ctx.fill();

    // Draw arms in dynamic surfing pose
    ctx.fillStyle = '#FF6B6B';
    // Back arm
    ctx.beginPath();
    ctx.moveTo(-4 * scale, -28 * scale);
    ctx.quadraticCurveTo(-12 * scale, -25 * scale, -10 * scale, -20 * scale);
    ctx.lineTo(-8 * scale, -22 * scale);
    ctx.quadraticCurveTo(-10 * scale, -26 * scale, -4 * scale, -28 * scale);
    ctx.fill();
    
    // Front arm
    ctx.beginPath();
    ctx.moveTo(4 * scale, -28 * scale);
    ctx.quadraticCurveTo(12 * scale, -25 * scale, 10 * scale, -20 * scale);
    ctx.lineTo(8 * scale, -22 * scale);
    ctx.quadraticCurveTo(10 * scale, -26 * scale, 4 * scale, -28 * scale);
    ctx.fill();

    // Draw head
    ctx.fillStyle = '#FFE4C4'; // Skin tone
    ctx.beginPath();
    ctx.arc(0, -33 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Draw hair
    ctx.fillStyle = '#8B4513'; // Brown hair
    ctx.beginPath();
    ctx.arc(0, -34 * scale, 4 * scale, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Add face direction (small black dot for eye)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(2 * scale, -33 * scale, 0.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw spray effect when surfing
    if (surfer.onWave) {
        const sprayIntensity = Math.min(1, difficulty.waveSpeed / 3);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * sprayIntensity})`;
        for (let i = 0; i < 3 + difficulty.waveSpeed; i++) {
            ctx.beginPath();
            ctx.arc(
                surfer.x - surfer.width/2 + Math.random() * surfer.width,
                surfer.y + surfer.height/4 + Math.random() * 10,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}

function updateDifficulty() {
    // Increase difficulty based on score
    const level = Math.floor(score / 500);
    
    difficulty.waveSpeed = BASE_WAVE_SPEED + (level * 0.3);
    difficulty.waveAmplitude = 50 + (level * 5);
    difficulty.waveFrequency = 0.02 + (level * 0.002);
    difficulty.sweetSpotSize = Math.max(15, 30 - (level * 2));
    difficulty.maxTilt = 0.3 + (level * 0.05);
    difficulty.windEffect = level * 0.5;
    difficulty.turbulence = level * 0.2;
}

function updateSurfer() {
    updateDifficulty();

    const waveY = getWaveY(surfer.x, wavePhase);
    const waveAngle = getWaveAngle(surfer.x, wavePhase);
    const targetY = waveY - 20;

    // Add wind effect
    surfer.x -= difficulty.windEffect;

    // Update surfer balance
    if (surfer.onWave) {
        // Balance becomes harder to maintain at higher speeds
        surfer.balance += (Math.random() - 0.5) * (difficulty.waveSpeed * 0.2);
        
        // Controls help correct balance
        if (keys.left) surfer.balance -= 0.1;
        if (keys.right) surfer.balance += 0.1;
        
        // Natural balance correction (gets harder at higher speeds)
        surfer.balance *= 0.95 - (difficulty.waveSpeed * 0.01);
    }

    // Fall if balance is too far off
    if (Math.abs(surfer.balance) > 1) {
        surfer.onWave = false;
        surfer.speedY = -5; // Jump off the wave
    }

    // Check if surfer is in the sweet spot of the wave
    const distanceFromIdeal = Math.abs(surfer.y - targetY);
    surfer.onWave = distanceFromIdeal < difficulty.sweetSpotSize;

    if (surfer.onWave) {
        // Adjust surfer position based on controls
        if (keys.left) {
            surfer.x -= 3 * difficulty.waveSpeed;
            surfer.angle = Math.max(waveAngle - difficulty.maxTilt, -0.5);
        } else if (keys.right) {
            surfer.x += 3;
            surfer.angle = Math.min(waveAngle + difficulty.maxTilt, 0.5);
        } else {
            surfer.angle = waveAngle;
        }

        // Slide down the wave if too high
        if (surfer.y < targetY - 10) {
            surfer.x -= difficulty.waveSpeed * 0.5;
        }

        // Keep surfer on the wave
        surfer.y = targetY + (surfer.balance * 10); // Balance affects vertical position
        score++;
    } else {
        // Apply gravity when not on wave
        surfer.speedY += GRAVITY;
        surfer.y += surfer.speedY;
        surfer.angle += 0.05;
    }

    // Check for game over conditions
    if (surfer.y > canvas.height || // Fell in water
        surfer.x < 0 || // Went too far left
        surfer.x > canvas.width * 0.9) { // Went too far right
        resetGame();
    }

    // Keep surfer within bounds
    surfer.x = Math.max(0, Math.min(canvas.width, surfer.x));
}

function resetGame() {
    surfer.x = canvas.width * 0.7;
    surfer.y = WATER_LEVEL - 50;
    surfer.speedY = 0;
    surfer.angle = 0;
    surfer.balance = 0;
    score = 0;
    
    // Reset difficulty
    difficulty.waveSpeed = BASE_WAVE_SPEED;
    difficulty.waveAmplitude = 50;
    difficulty.waveFrequency = 0.02;
    difficulty.sweetSpotSize = 30;
    difficulty.maxTilt = 0.3;
    difficulty.windEffect = 0;
    difficulty.turbulence = 0;
    
    const gameStatus = document.getElementById('gameStatus');
    gameStatus.style.display = 'block';
    gameStatus.textContent = 'Game Over! Press any key to restart';
    
    const restartHandler = (e) => {
        gameStatus.style.display = 'none';
        document.removeEventListener('keydown', restartHandler);
    };
    document.addEventListener('keydown', restartHandler);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function gameLoop() {
    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#1E90FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update wave phase
    wavePhase += 0.02;
    
    // Draw game elements
    drawWave(wavePhase);
    updateSurfer();
    drawSurfer();
    updateScore();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
