/* eslint-disable no-void */
import { FIGHTER_WIDTH, VampirismStep } from '@labrute/core';

import { sound } from '@pixi/sound';
import { Easing, Tweener } from 'pixi-tweener';
import { Application } from 'pixi.js';
import { getRandomPosition } from './utils/fightPositions';
import findFighter, { AnimationFighter } from './utils/findFighter';
import { displayHeal } from './utils/displayHeal';
import displayDamage from './utils/displayDamage';

export const vampirism = async (
  app: Application,
  fighters: AnimationFighter[],
  step: VampirismStep,
  speed: React.MutableRefObject<number>,
) => {
  const brute = findFighter(fighters, step.b);
  if (!brute) {
    throw new Error('Brute not found');
  }
  const target = findFighter(fighters, step.t);
  if (!target) {
    throw new Error('Target not found');
  }

  // Move brute to target position
  await Tweener.add({
    target: brute.animation.container,
    duration: 0.25 / speed.current,
    ease: Easing.linear,
  }, {
    x: target.animation.team === 'right'
      ? target.animation.container.x + FIGHTER_WIDTH.brute / 2
      : target.animation.container.x - FIGHTER_WIDTH.brute / 2,
    y: target.animation.container.y - 1,
  });

  // Reverse brute
  brute.animation.container.scale.x *= -1;

  // Set brute animation to `steal`
  brute.animation.setAnimation('steal');

  // Play steal SFX
  void sound.play('skills/tragicPotion', { speed: speed.current });

  const animationEnded = target.animation.waitForEvent('stolen:end');

  // Set target animation to `stolen`
  target.animation.setAnimation('stolen');

  displayHeal(app, brute, step.h, speed);
  displayDamage(app, target, step.d, speed);

  // Wait for animation to finish
  await animationEnded;

  // Restore scale
  brute.animation.container.scale.x *= -1;

  // Set target animation to `idle`
  target.animation.setAnimation('idle');

  const { x, y } = getRandomPosition(fighters, brute.animation.team);

  // Move brute to position
  await Tweener.add({
    target: brute.animation.container,
    duration: 0.25 / speed.current,
    ease: Easing.linear,
  }, {
    x,
    y,
  });

  // Set brute animation to `idle`
  brute.animation.setAnimation('idle');
};