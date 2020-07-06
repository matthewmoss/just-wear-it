![alt text](https://just-wear-it.s3-us-west-2.amazonaws.com/open-graph-image.png)

# JustWearIt.FYI

JustWearIt.FYI visualizes how wearing a mask reduces the spread of COVID-19. The simulation is built using [p5.js](https://p5js.org) and vanilla HTML / CSS.

**Important: While our simulation accounts for basic factors in COVID-19 spread, it is intended to raise awareness and should not be treated as a scientific model. You can learn more from the experts [here](https://www.preprints.org/manuscript/202004.0203/v1).**

## Simulation Details

### Variables

The simulation takes into account the following factors when modeling COVID-19 spread:

- `maskPercentage`: Percentage of population that wear a mask.
- `maskEffectiveness`: How effective a mask is at stopping a sick particle from spreading COVID.
- `recoveryPercentage`: Likelyhood of a particle recovering after getting sick.
- `avgIllnessDuration`: Average illness duration in weeks of the sickness. Slightly randomized for each particle.
- `secondsPerWeek`: How long a week takes to pass.
- `transmissionRate`: Likelyhood of a sick particle transmitting the virus when in range of another particle.
- `transmissionDistanceScale`: Minimum transmission distance. Transmission is attempted only once when a particle comes within range. Scaled for window size.
- `populationHealth`: The initial percentage of healthy people. `isHealthy` property is randomly assigned for each particle according to this probability.
- `speedPercentage`: Average speed of a particle. Scaled for window size. Randomized for each particle. 
- `sizePercentage`: Size of a particle. Unrelated to simulation dynamics. Scaled for window size.
- `densityScale`: Density of particles. Scaled for window size.

### Calculations

When a healthy particle comes within range of a sick particle, the sick particle transmits as follows:

```
var likelyhood = transmissionRate;
if (this.isWearingMask) {
   likelyhood *= (1 - maskEffectiveness); 
}
```

Note that infection likelyhood is dependent on if the *sick* particle is wearing a mask, not the healthy particle. This is because masks do more to prevent sick people from spreading the virus than healthy people from getting it.

The transmission is attempted a single time when a healthy particle comes within range of a sick particle, instead of continously while the two are in-range. While both strategies could work, the later means that slowing the speed of the particles would increase transmission rate, as they would now be in-range for longer. This doesn't work great in practice, so a single tranmission attempt is used instead. Once two particles move out of range, another transmission attempt will occur if they move back in range at a later point.

## Roadmap

Here's a quick overview of features we'd like to add. See Issues for more details. If you're able to help, that would be much appreciated :)

- [ ] **City Picker:** The site would pull in city data for mask usage, population density, population health, etc. and let you pick a city to simulate.
- [ ] **Localizations:** Translate the website into different languages.
- [ ] **Custom Donation Box:** Collect donations through Stripe and split between several COVID-related charities. Haven't found a great framework for this, so currently the site links out to Omaze.

## About

This website was created by [Matt Moss](https://twitter.com/thefuturematt) and [Maas Lalani](https://twitter.com/maaslalani). It was inspired by [this article](https://www.theatlantic.com/health/archive/2020/04/dont-wear-mask-yourself/610336/?scrollnoblockerrefresh=1) in The Atlantic and [this interactive essay](https://meltingasphalt.com/interactive/outbreak/) by Kevin Simler (the project is not associated with any of the inspirations mentioned).

If you've got any feedback or questions, [email us](mailto:matthewmoss@me.com) or reach out on [Twitter](https://twitter.com/thefuturematt)!
