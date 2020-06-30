//
// Particle
//
class Particle {
  // Create particle
  constructor(p, populationHealth, maskUtilization, recoveryPercentage, secondsPerWeek, speed, size, onInfection, onRecovery, onFatality) {

    // Assign completions
    this.onInfection = onInfection;
    this.onRecovery = onRecovery;
    this.onFatality = onFatality;

    this.p = p;

    // Set size
    this.r = size;

    // Set pulse
    this.pulseR = this.r;
    this.pulseAlpha = 0.0;
    this.pulseAlphaDelta = 0.95;

    // Set healthty
    this.isHealthy = p.random(0.0, 1.0) < populationHealth;
    this.isWearingMask = p.random(0.0, 1.0) < maskUtilization;
    if (!this.isHealthy) {
      this.infect(p);
    }

    // Calculate chance of recovery
    this.willRecover = p.random(0.0, 1.0) < recoveryPercentage;
    this.isRecovered = false;
    this.isDead = false;

    // Calculate illness duration
    this.recoveryDuration = p.random(2.0, 4.0) * secondsPerWeek;
    this.deathDuration = p.random(2.0, 4.0) * secondsPerWeek;

    // Start at random point
    this.x = p.random(0, p.width);
    this.y = p.random(0, p.height);

    // Set speed
    this.xSpeed = p.random(-speed, speed);
    this.ySpeed = p.random(-speed, speed);

    // Load in images
    this.noMaskHealthyImage = p.loadImage('assets/no_mask_healthy.png');
    this.maskHealthyImage = p.loadImage('assets/mask_healthy.png');
    this.noMaskSickImage = p.loadImage('assets/no_mask_sick.png');
    this.maskSickImage = p.loadImage('assets/mask_sick.png');

  }

  // Create particle
  createParticle() {
    this.p.noStroke();

    // Update pulse
    this.updatePulse(this.p);

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
      this.p.image(emoji, this.x - this.r / 2, this.y - this.r / 2, this.r, this.r);
    }

  }

  // Move particle according to speed
  moveParticle() {
    if (this.x < 0 || this.x > this.width)
      this.xSpeed *= -1;
    if (this.y < 0 || this.y > this.height)
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
      this.onRecovery(this.p);
    } else if (!this.willRecover && duration >= this.deathDuration) {
      this.isDead = true;
      this.onFatality(this.p);
    }
  }

  // Trasmit
  trasmit(particles, transmissionRate, maskEffectiveness, transmissionDistance) {
    particles.forEach(element => {

      // Skip emojis that are already sick
      if (!element.isHealthy || element === this || element.isRecovered || element.isDead)
        return;

      // Check if in range
      let dis = this.p.dist(this.x, this.y, element.x, element.y);
      if (dis < transmissionDistance) {

        // Calculate likelyhood of catching it
        var likelyhood = transmissionRate;
        if (this.isWearingMask) {
          likelyhood *= (1 - maskEffectiveness); 
        }
        if (this.p.random(0, 1.0) <= likelyhood) {
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
    this.onInfection(this.p);
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
    this.pulseAlpha = this.p.max(this.pulseAlpha, 0);

    let opacity = 0.8 * this.pulseAlpha;
    this.p.fill(`rgba(255,56,56,${opacity})`);
    this.p.circle(this.x,this.y,this.pulseR);
  }

}

// Setup canvas
var p1 = function(p) {
  // Define config
  p.populationHealth = 0.92; // Initial percentage of healthy people
  p.maskPercentage = 0.0; // Percentage of mask wearers
  p.transmissionRate = 0.037; // Rate of transmission
  p.maskEffectiveness = 0.7; // Effectiveness of mask
  p.transmissionDistance = 7; // How closed to transmit
  p.recoveryPercentage = 0.95; // Percent of emoji that recover
  p.secondsPerWeek = 8.0; // Seconds per week
  p.speed = 2; // Speed of emoji
  p.size = 24;

  p.emojiCount = 0;
  p.currentSickCount = 0;
  p.totalSickCount = 0;
  p.recoveredCount = 0;
  p.fatalityCount = 0;

  // UI Helpers
  let isMasked = p.maskPercentage > 0; // Customizes UI for sim where emojis where masks
  p.setup = function() {
    // Load fonts
    this.ultraGothamFont = p.loadFont('assets/gotham-ultra.otf');
    this.boldGothamFont = p.loadFont('assets/gotham-bold.otf');

    p.particles = [];
    p.createCanvas(600, 670);
    emojiCount = p.width / 6;
    for (let i = 0; i < emojiCount; i++) {
      p.particles.push(new Particle(
        p,
        p.populationHealth,
        p.maskPercentage,
        p.recoveryPercentage,
        p.secondsPerWeek,
        p.speed,
        p.size,
        onInfection,
        onRecovery,
        onFatality
      ));
    }
  }

  p.draw = function () {
    // Draw background
    if (!isMasked) {

      // Calculate redness as a function of current infection
      let redAlpha = 0.95 * (p.currentSickCount / p.emojiCount) + 0.05; 
      p.background('#FCFCFC');
      p.fill(`rgba(255,69,69,${redAlpha})`);
      p.rect(0,0,p.width,p.height);
    } else {
      p.background('#FCFCFC');
    }

    // Config text based on mode
    let mainTitle = isMasked ? 'MASKS' : 'NO\nMASKS';
    let titleColor = isMasked ? 'rgba(202,202,202,1.0)' : 'rgba(255,45,45,1.0)';
    let mainTitleOffset = isMasked ? (p.height / 2 - 80) : (p.height / 2 - 106);
    let secondaryTitleOffset = isMasked ? (p.height / 2 - 36) : (p.height / 2 - 20);

    // Display main title
    p.textAlign(p.CENTER);
    p.textSize(36);
    p.textLeading(74);
    p.textFont(p.ultraGothamFont);
    p.fill(titleColor);
    p.text(mainTitle, 0, mainTitleOffset, p.width, 118);

    // Display main subtitle
    let currentSickPercentage = Math.round((p.currentSickCount / p.emojiCount) * 100);
    let totalSickPercentage = Math.round((p.totalSickCount / p.emojiCount) * 100);
    let recoveredPercentage = Math.round((p.recoveredCount / p.emojiCount) * 100);
    let fatalityPercentage = Math.round((p.fatalityCount / p.emojiCount) * 100);
    let stats = `\n${currentSickPercentage}% SICK\n${totalSickPercentage}% CONTRACTED\n${recoveredPercentage}% RECOVERED\n${fatalityPercentage}% FATALITIES`;
    p.textAlign(p.CENTER);
    p.textSize(22);
    p.textLeading(26);
    p.textFont(p.boldGothamFont);
    p.fill(titleColor);
    p.text(stats, 0, secondaryTitleOffset, p.width, 300);

    // Add emoji particles
    for(let i = 0; i < p.particles.length; i++) {
      p.particles[i].moveParticle();
      if (!p.particles[i].isHealthy && !p.particles[i].isDead)
        p.particles[i].trasmit(p.particles, p.transmissionRate, p.maskEffectiveness, p.transmissionDistance);
      p.particles[i].checkHealthStatus();
      p.particles[i].createParticle();
    }

  }
}

// Called when an emoji is infected
function onInfection(p) {
  p.totalSickCount++;
  p.currentSickCount++;
  printState(p);
}


// Called when an emoji recovers
function onRecovery(p) {
  p.recoveredCount++;
  p.currentSickCount--;
  printState(p);
}

// Called when an emoji dies
function onFatality(p) {
  p.fatalityCount++;
  p.currentSickCount--;
  printState(p);
}

// Helper to print the state of the sim
function printState(p) {
  let currentSickPercentage = Math.round((p.currentSickCount / p.emojiCount) * 100);
  let totalSickPercentage = Math.round((p.totalSickCount / p.emojiCount) * 100);
  let recoveredPercentage = Math.round((p.recoveredCount / p.emojiCount) * 100);
  let fatalityPercentage = Math.round((p.fatalityCount / p.emojiCount) * 100);
  p.print(`currently sick: ${currentSickPercentage}%, total sick: ${totalSickPercentage}%, recovered: ${recoveredPercentage}%, fatality: ${fatalityPercentage}%`)
}

var canvas1 = new p5(p1);
var canvas2 = new p5(p1);
