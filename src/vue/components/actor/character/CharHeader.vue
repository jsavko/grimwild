<template>
	<header class="sheet-header flexrow">
		<div class="header-fields flexcol">
			<!-- Stats / Marks -->
			<div class="stats grid grid-4col">
				<div v-for="(stat, statKey) in actor.system.stats" :key="statKey" class="stat form-group stacked">
					<label>
						<button type="button" data-action="roll" data-roll-type="stat" :data-stat="statKey">{{stat.label}}</button>
					</label>
					<div class="flexrow">
						<input type="checkbox"
							:name="`system.stats.${statKey}.marked`"
							v-model="context.actor.system.stats[statKey].marked" 
							class="marked"
							:data-tooltip="game.i18n.localize('GRIMWILD.Damage.marked')" 
						/>
						<input type="text"
							:name="`system.stats.${statKey}.value`"
							v-model="context.actor.system.stats[statKey].value"
						/>
					</div>
				</div>
			</div>
			<!-- Bloodied / Rattled -->
			<div class="harm grid grid-2col">
				<div class="form-group">
					<label>{{ game.i18n.localize('GRIMWILD.Damage.bloodied') }}</label>
					<input type="number"
						name="system.bloodied.diceNum"
						v-model="context.actor.system.bloodied.diceNum"
					/>
				</div>
				<div class="form-group">
					<label>{{ game.i18n.localize('GRIMWILD.Damage.rattled') }}</label>
					<input type="number"
						name="system.rattled.diceNum"
						v-model="context.actor.system.rattled.diceNum"
					/>
				</div>
			</div>
		</div>
		<!-- Spark / Story -->
		<div class="metacurrency-fields flexcol">
			<div class="spark form-group stacked">
				<label>{{ context.systemFields.spark.label }}</label>
				<div class="form-inputs">
					<input type="checkbox"
						name="system.spark.steps.0"
						v-model="context.actor.system.spark.steps[0]"
					/>
					<input type="checkbox"
						name="system.spark.steps.1"
						v-model="context.actor.system.spark.steps[1]"
					/>
				</div>
			</div>
			<div class="story form-group stacked">
				<label>{{ context.systemFields.story.label }}</label>
				<div class="form-inputs">
					<input type="checkbox"
						name="system.story.steps.0"
						v-model="context.actor.system.story.steps[0]"
					/>
					<input type="checkbox"
						name="system.story.steps.1"
						v-model="context.actor.system.story.steps[1]"
					/>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup>
import { inject } from 'vue';
const props = defineProps(['context']);
const actor = inject('rawDocument');
</script>