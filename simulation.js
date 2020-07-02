//
// Particle
//
class Particle {
  
  // Create particle
  constructor(p5, populationHealth, maskUtilization, recoveryPercentage, secondsPerWeek, speed, size, onInfection, onRecovery, onFatality) {
		
		// Assign p5
		this.p5 = p5;
		
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
    this.isHealthy = this.p5.random(0.0, 1.0) < populationHealth;
		this.isWearingMask = this.p5.random(0.0, 1.0) < maskUtilization;
		this.isSaved = false;

    if (!this.isHealthy) {
      this.infect();
    }
    
    // Calculate chance of recovery
    this.willRecover = this.p5.random(0.0, 1.0) < recoveryPercentage;
    this.isRecovered = false;
    this.isDead = false;
    
    // Calculate illness duration
    this.recoveryDuration = this.p5.random(2.0, 4.0) * secondsPerWeek;
    this.deathDuration = this.p5.random(2.0, 4.0) * secondsPerWeek;
    
		// Start at random point
		let radius = this.r / 2;
    this.x = this.p5.random(radius, this.p5.width - radius);
    this.y = this.p5.random(radius, this.p5.height - radius);

    // Set speed
    this.xSpeed = this.p5.random(-speed, speed);
    this.ySpeed = this.p5.random(-speed, speed);
    
  }

  // Create particle
  createParticle() {
    this.p5.noStroke();
    
    // Update pulse
    this.updatePulse();
    
    // Get image
    let emoji;
    if (this.isHealthy && this.isWearingMask) {
			if (this.saved) {
				emoji = this.p5.maskSavedHealthyImage;
			} else {
				emoji = this.p5.maskHealthyImage;
			}
    } else if (!this.isHealthy && this.isWearingMask) {
      emoji = this.p5.maskSickImage;
    } else if (this.isHealthy && !this.isWearingMask) {
			if (this.saved) {
				emoji = this.p5.noMaskSavedHealthyImage;
			} else {
				emoji = this.p5.noMaskHealthyImage;
			}
    } else {
      emoji = this.p5.noMaskSickImage;
    }
		
		let size = this.isHealthy ? this.r : this.r;
    if (!this.isDead) {
			this.p5.image(emoji, this.x - size / 2, this.y - size / 2, size, size);
    }

  }

  // Move particle according to speed
  moveParticle() {
		let radius = this.r / 2;
    if (this.x < radius || this.x > this.p5.width - radius)
      this.xSpeed *= -1;
    if (this.y < radius || this.y > this.p5.height - radius)
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
      let dis = this.p5.dist(this.x, this.y, element.x, element.y);
      if (dis < transmissionDistance) {
        
        // Calculate likelyhood of catching it
        var likelyhood = transmissionRate;
        if (this.isWearingMask) {
           likelyhood *= (1 - maskEffectiveness); 
        }
        if (this.p5.random(0, 1.0) <= likelyhood) {
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
    this.onInfection(this);
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
    this.pulseR *= 1.03;
    this.pulseAlphaDelta -= 0.0003;
    this.pulseAlpha *= this.pulseAlphaDelta;
    this.pulseAlpha = this.p5.max(this.pulseAlpha, 0);
      
    let opacity = 0.8 * this.pulseAlpha;
    this.p5.fill(`rgba(255,56,56,${opacity})`);
    this.p5.circle(this.x,this.y,this.pulseR);
  }

}

//
// Simulation
//

var simulation = function(p5) {

	// Define config
	p5.populationHealth = 0.92; // Initial percentage of healthy people
	p5.maskPercentage = 0.0; // Percentage of mask wearers
	p5.transmissionRate = 0.037; // Rate of transmission
	p5.maskEffectiveness = 0.7; // Effectiveness of mask
	p5.recoveryPercentage = 0.95; // Percent of emoji that recover
	p5.secondsPerWeek = 8.0; // Seconds per week

	// Resets the simulation
	p5.reset = function() {

		// Scale based on screen size
		if (p5.width < 600) {
			p5.size = 15;
			p5.speed = 1.5;
			p5.density = 1 / 3.7;
			p5.transmissionDistance = 5.5;
		}  else {
			p5.size = 20;
			p5.speed = 2;
			p5.density = 1 / 4;
			p5.transmissionDistance = 7;
		}

		// Track stats
		p5.emojiCount = 0;
		p5.currentSickCount = 0;
		p5.totalSickCount = 0;
		p5.recoveredCount = 0;
		p5.fatalityCount = 0;

		// UI Helpers
		p5.isMasked = p5.maskPercentage > 0; // Customizes UI for sim where emojis where masks

		// Add particles
		p5.particles = [];
		p5.addParticles();

	}

	// Creates particles
	p5.addParticles = function() {
		p5.emojiCount = p5.min(p5.width, p5.height) * p5.density;
		for (let i = 0; i < p5.emojiCount; i++) {
			p5.particles.push(new Particle(
				p5,
				p5.populationHealth,
				p5.maskPercentage,
				p5.recoveryPercentage,
				p5.secondsPerWeek,
				p5.speed,
				p5.size,
				p5.onInfection,
				p5.onRecovery,
				p5.onFatality
			));
		}
	}

	// Setup canvas
	p5.setup = function() {
		
		// Load fonts
		p5.ultraGothamFont = p5.loadFont('assets/gotham-ultra.otf');
		p5.boldGothamFont = p5.loadFont('assets/gotham-bold.otf');

		// Load in images
		p5.noMaskHealthyImage = p5.loadImage('assets/no_mask_healthy.png');
		p5.maskHealthyImage = p5.loadImage('assets/mask_healthy.png');
    p5.noMaskSickImage = p5.loadImage('assets/no_mask_sick.png');
		p5.maskSickImage = p5.loadImage('assets/mask_sick.png');
		
		// Create canvas
		if (p5.windowWidth > p5.windowHeight) {
			p5.createCanvas(p5.windowWidth / 2 - 3, p5.windowHeight - 50); // vertical split
		} else {
			p5.createCanvas(p5.windowWidth, p5.windowHeight / 2 - 3 - 26); // horizontal split
		}

		// Add emoji
		p5.reset()

	}

	// Render canvas
	p5.draw = function() {
		
		// Draw background
		if (!p5.isMasked) {

			// Calculate redness as a function of current infection
			let redAlpha = 0.95 * (p5.currentSickCount / p5.emojiCount) + 0.05; 
			p5.background('#FCFCFC');
			p5.fill(`rgba(255,69,69,0.0)`);
			p5.rect(0, 0, p5.width, p5.height);

		} else {
			p5.background('#FCFCFC');
		}
		
		// Config text based on mode
		let mainTitle = p5.isMasked ? 'MASKS' : 'NO\nMASKS';
		let titleColor = p5.isMasked ? 'rgba(202,202,202,1.0)' : 'rgba(255,45,45,1.0)';
		let mainTitleOffset = p5.isMasked ? (p5.height / 2 - 80) : (p5.height / 2 - 106);
		let secondaryTitleOffset = p5.isMasked ? (p5.height / 2 - 36) : (p5.height / 2 - 20);
		let isHorizontalSplit = p5.width > p5.height;
		if (isHorizontalSplit) {
			mainTitleOffset += 14;
			secondaryTitleOffset += 14;
		}
		let titleSize = isHorizontalSplit ? 30 : 36;
		let titleLeading = isHorizontalSplit ? 66 : 74;
		let subtitleSize = isHorizontalSplit ? 18 : 22;
		let subtitleLeading = isHorizontalSplit ? 22 : 26;

		// Display main title
		p5.textAlign(p5.CENTER);
		p5.textSize(titleSize);
		p5.textLeading(titleLeading);
		p5.textFont(p5.ultraGothamFont);
		p5.fill(titleColor);
		p5.text(mainTitle, 0, mainTitleOffset, p5.width, 118);
		
		// Display main subtitle
		let currentSickPercentage = Math.round((p5.currentSickCount / p5.emojiCount) * 100);
		let totalSickPercentage = Math.round((p5.totalSickCount / p5.emojiCount) * 100);
		let recoveredPercentage = Math.round((p5.recoveredCount / p5.emojiCount) * 100);
		let fatalityPercentage = Math.round((p5.fatalityCount / p5.emojiCount) * 100);
		let stats = `\n${currentSickPercentage}% SICK\n${totalSickPercentage}% CONTRACTED\n${recoveredPercentage}% RECOVERED\n${fatalityPercentage}% FATALITIES`;
		p5.textAlign(p5.CENTER);
		p5.textSize(subtitleSize);
		p5.textLeading(subtitleLeading);
		p5.textFont(p5.boldGothamFont);
		p5.fill(titleColor);
		p5.text(stats, 0, secondaryTitleOffset, p5.width, 300);

		// Add emoji particles
		for(let i = 0; i < p5.particles.length; i++) {
			p5.particles[i].moveParticle();
			if (!p5.particles[i].isHealthy && !p5.particles[i].isDead)
			p5.particles[i].trasmit(p5.particles, p5.transmissionRate, p5.maskEffectiveness, p5.transmissionDistance);
			p5.particles[i].checkHealthStatus();
			p5.particles[i].createParticle();
		}

	}

	p5.windowResized = function() {
		p5.reset();
		if (p5.windowWidth > p5.windowHeight) {
			p5.resizeCanvas(p5.windowWidth / 2 - 3, p5.windowHeight - 50); // vertical split
		} else {
			p5.resizeCanvas(p5.windowWidth, p5.windowHeight / 2 - 3 - 26); // horizontal split
		}
	}

	// Sets mask percentage
	p5.setMaskPercentage = function(maskPercentage) {
		p5.maskPercentage = maskPercentage;
	}

	// Called when an emoji is infected
	p5.onInfection = function(particle) {
		p5.totalSickCount++;
		p5.currentSickCount++;
		let index = p5.particles.indexOf(particle);
		if (index >= 0) {
			p5.infectionHelper(p5.particles.indexOf(particle));
		}
	}

	// Helper to be overridden outside the sim
	p5.infectionHelper = function(particleIndex) {

	}

	// Calls outside the sim so infections can be updated in the other 
	p5.handleInfectionInOtherSim = function(index) {
		if (!p5.particles[index].isInfected && !p5.particles.isRecovered && !p5.particles.isDead) {
			p5.particles[index].isSaved = true;
		}
	}

	// Called when an emoji recovers
	p5.onRecovery = function() {
		p5.recoveredCount++;
		p5.currentSickCount--;
	}

	// Called when an emoji dies
	p5.onFatality = function() {
		p5.fatalityCount++;
		p5.currentSickCount--;
	}

	// Helper to print the state of the sim
	p5.printState = function() {
		let currentSickPercentage = Math.round((p5.currentSickCount / p5.emojiCount) * 100);
		let totalSickPercentage = Math.round((p5.totalSickCount / p5.emojiCount) * 100);
		let recoveredPercentage = Math.round((p5.recoveredCount / p5.emojiCount) * 100);
		let fatalityPercentage = Math.round((p5.fatalityCount / p5.emojiCount) * 100);
		p5.print(`currently sick: ${currentSickPercentage}%, total sick: ${totalSickPercentage}%, recovered: ${recoveredPercentage}%, fatality: ${fatalityPercentage}%`)
	}

}

// Generate a random seed so both simulations perform exactly the same
let randomSeed =  Math.random();

// Add mask simulator
var noMaskSimulation = new p5(simulation);
noMaskSimulation.randomSeed(randomSeed); // Use same random seed
noMaskSimulation.setMaskPercentage(0.0); // Set mask percentage to zero
noMaskSimulation.infectionHelper = function(particleIndex) {
	maskSimulation.handleInfectionInOtherSim(particleIndex)
}

var maskSimulation = new p5(simulation);
maskSimulation.randomSeed(randomSeed); // use same random seed
maskSimulation.setMaskPercentage(1.0); // Set mask percentage to one

// Simulation helpers
var isPaused = false;
function togglePause() {
	if (isPaused) {
		noMaskSimulation.loop();
		maskSimulation.loop();
	} else {
		noMaskSimulation.noLoop();
		maskSimulation.noLoop();
	}
	isPaused = !isPaused;
}
