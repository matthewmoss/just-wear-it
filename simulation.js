//
// Particle
//
class Particle {
  
  // Create particle
  constructor(populationHealth, maskUtilization, recoveryPercentage, secondsPerWeek, speed, size, onInfection, onRecovery, onFatality) {
    
    // Assign completions
    this.onInfection = onInfection;
    this.onRecovery = onRecovery;
    this.onFatality = onFatality;
    
    // Set size
    this.r = size;
    
    // Set pulse
    this.pulseR = this.r;
    this.pulseAlpha = 0.0;
    this.pulseAlphaDelta = 0.95;
    
    // Set healthty
    this.isHealthy = random(0.0, 1.0) < populationHealth;
    this.isWearingMask = random(0.0, 1.0) < maskUtilization;
    if (!this.isHealthy) {
      this.infect();
    }
    
    // Calculate chance of recovery
    this.willRecover = random(0.0, 1.0) < recoveryPercentage;
    this.isRecovered = false;
    this.isDead = false;
    
    // Calculate illness duration
    this.recoveryDuration = random(2.0, 4.0) * secondsPerWeek;
    this.deathDuration = random(2.0, 4.0) * secondsPerWeek;
    
    // Start at random point
    this.x = random(0, width);
    this.y = random(0, height);

    // Set speed
    this.xSpeed = random(-speed, speed);
    this.ySpeed = random(-speed, speed);
    
    // Load in images
    this.noMaskHealthyImage = loadImage('assets/no_mask_healthy.png');
    this.maskHealthyImage = loadImage('assets/mask_healthy.png');
    this.noMaskSickImage = loadImage('assets/no_mask_sick.png');
    this.maskSickImage = loadImage('assets/mask_sick.png');
    
  }

  // Create particle
  createParticle() {
    noStroke();
    
    // Update pulse
    this.updatePulse();
    
    // Get image
    let emoji;
    if (this.isHealthy && this.isWearingMask) {
      emoji = this.maskHealthyImage;
    } else if (!this.isHealthy && this.isWearingMask) {
      emoji = this.maskSickImage;
    } else if (this.isHealthy && !this.isWearingMask) {
      emoji = this.noMaskHealthyImage;
    } else {
      emoji = this.noMaskSickImage;
    }
    
    if (!this.isDead) {
      image(emoji, this.x - this.r / 2, this.y - this.r / 2, this.r, this.r);
    }

  }

  // Move particle according to speed
  moveParticle() {
    if (this.x < 0 || this.x > width)
      this.xSpeed *= -1;
    if (this.y < 0 || this.y > height)
      this.ySpeed *= -1;
    
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }
  
  // Check health status
  checkHealthStatus() {
    if (this.isHealthy || this.isRecovered || this.isDead)
      return;
      
    let duration = (Date.now() - this.transmissionTime) / 1000;
    if (this.willRecover && duration >= this.recoveryDuration) {
      this.isRecovered = true;
      this.isHealthy = true;
      this.onRecovery();
    } else if (!this.willRecover && duration >= this.deathDuration) {
      this.isDead = true;
      this.onFatality();
    }
  }
  
  // Trasmit
  trasmit(particles, transmissionRate, maskEffectiveness, transmissionDistance) {
    particles.forEach(element => {
      
      // Skip emojis that are already sick
      if (!element.isHealthy || element === this || element.isRecovered || element.isDead)
        return;
        
      // Check if in range
      let dis = dist(this.x, this.y, element.x, element.y);
      if (dis < transmissionDistance) {
        
        // Calculate likelyhood of catching it
        var likelyhood = transmissionRate;
        if (this.isWearingMask) {
           likelyhood *= (1 - maskEffectiveness); 
        }
        if (random(0, 1.0) <= likelyhood) {
          element.infect();
          element.pulse();
        }
        
      }
      
    });
  }
  
  // Infect
  infect() {
    this.isHealthy = false;
    this.transmissionTime = Date.now();
    this.onInfection();
  }
  
  // Send pulse
  pulse() {
    this.pulseAlpha = 1.0;
  }
  
  updatePulse() {
    
    // Check pulse is in progress
    if (this.pulseAlpha <= 0.01) {
      return
    }
      
    // Update pulse
    this.pulseR *= 1.025;
    this.pulseAlphaDelta -= 0.0005
    this.pulseAlpha *= this.pulseAlphaDelta;
    this.pulseAlpha = max(this.pulseAlpha, 0);
      
    let opacity = 0.8 * this.pulseAlpha;
    fill(`rgba(255,56,56,${opacity})`);
    circle(this.x,this.y,this.pulseR);
  }

}

//
// Simulation
//

// Define config
let populationHealth = 0.92; // Initial percentage of healthy people
let maskPercentage = 0.0; // Percentage of mask wearers
let transmissionRate = 0.037; // Rate of transmission
let maskEffectiveness = 0.7; // Effectiveness of mask
let transmissionDistance = 7; // How closed to transmit
let recoveryPercentage = 0.95; // Percent of emoji that recover
let secondsPerWeek = 8.0; // Seconds per week
let speed = 2; // Speed of emoji
let size = 24;

// Track stats
var emojiCount = 0;
var currentSickCount = 0;
var totalSickCount = 0;
var recoveredCount = 0;
var fatalityCount = 0;

// UI Helpers
let isMasked = maskPercentage > 0; // Customizes UI for sim where emojis where masks

// Particles
let particles = [];

// Setup canvas
function setup() {
  
  // Load fonts
  this.ultraGothamFont = loadFont('assets/gotham-ultra.otf');
  this.boldGothamFont = loadFont('assets/gotham-bold.otf');
  
  createCanvas(600, 670);
  emojiCount = width / 6;
  for (let i = 0; i < emojiCount; i++) {
    particles.push(new Particle(
      populationHealth,
      maskPercentage,
      recoveryPercentage,
      secondsPerWeek,
      speed,
      size,
      onInfection,
      onRecovery,
      onFatality
    ));
  }
}

// Called when an emoji is infected
function onInfection() {
  totalSickCount++;
  currentSickCount++;
  printState();
}


// Called when an emoji recovers
function onRecovery() {
  recoveredCount++;
  currentSickCount--;
  printState();
}

// Called when an emoji dies
function onFatality() {
  fatalityCount++;
  currentSickCount--;
  printState();
}

// Helper to print the state of the sim
function printState() {
  let currentSickPercentage = Math.round((currentSickCount / emojiCount) * 100);
  let totalSickPercentage = Math.round((totalSickCount / emojiCount) * 100);
  let recoveredPercentage = Math.round((recoveredCount / emojiCount) * 100);
  let fatalityPercentage = Math.round((fatalityCount / emojiCount) * 100);
  print(`currently sick: ${currentSickPercentage}%, total sick: ${totalSickPercentage}%, recovered: ${recoveredPercentage}%, fatality: ${fatalityPercentage}%`)
}

// Render canvas
function draw() {
  
  // Draw background
  if (!isMasked) {

    // Calculate redness as a function of current infection
    let redAlpha = 0.95 * (currentSickCount / emojiCount) + 0.05; 
    background('#FCFCFC');
    fill(`rgba(255,69,69,${redAlpha})`);
    rect(0,0,width,height);

  } else {
    background('#FCFCFC');
  }
  
  // Config text based on mode
  let mainTitle = isMasked ? 'MASKS' : 'NO\nMASKS';
  let titleColor = isMasked ? 'rgba(202,202,202,1.0)' : 'rgba(255,45,45,1.0)';
  let mainTitleOffset = isMasked ? (height / 2 - 80) : (height / 2 - 106);
  let secondaryTitleOffset = isMasked ? (height / 2 - 36) : (height / 2 - 20);

  // Display main title
  textAlign(CENTER);
  textSize(36);
  textLeading(74);
  textFont(this.ultraGothamFont);
  fill(titleColor);
  text(mainTitle, 0, mainTitleOffset, width, 118);
  
  // Display main subtitle
  let currentSickPercentage = Math.round((currentSickCount / emojiCount) * 100);
  let totalSickPercentage = Math.round((totalSickCount / emojiCount) * 100);
  let recoveredPercentage = Math.round((recoveredCount / emojiCount) * 100);
  let fatalityPercentage = Math.round((fatalityCount / emojiCount) * 100);
  let stats = `\n${currentSickPercentage}% SICK\n${totalSickPercentage}% CONTRACTED\n${recoveredPercentage}% RECOVERED\n${fatalityPercentage}% FATALITIES`;
  textAlign(CENTER);
  textSize(22);
  textLeading(26);
  textFont(this.boldGothamFont);
  fill(titleColor);
  text(stats, 0, secondaryTitleOffset, width, 300);
  
  // Add emoji particles
  for(let i = 0; i < particles.length; i++) {
    particles[i].moveParticle();
    if (!particles[i].isHealthy && !particles[i].isDead)
      particles[i].trasmit(particles, transmissionRate, maskEffectiveness, transmissionDistance);
    particles[i].checkHealthStatus();
    particles[i].createParticle();
  }

}