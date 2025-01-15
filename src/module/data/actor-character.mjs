import GrimwildActorBase from "./base-actor.mjs";

export default class GrimwildCharacter extends GrimwildActorBase {
	static LOCALIZATION_PREFIXES = ["GRIMWILD.Actor.Character"];

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.class = new fields.StringField({ required: true, blank: true });

		schema.xp = new fields.NumberField({
			integer: true,
			initial: 0,
			min: 0
		});
		
		schema.level = new fields.NumberField({
			...requiredInteger,
			initial: 1,
			min: 1
		});
		

		schema.attributes = new fields.SchemaField({
			level: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 1 })
			})
		});

		// should these have some sort of healing pool attached to them?
		schema.bloodied = new fields.BooleanField();
		schema.rattled = new fields.BooleanField();
		schema.conditions = new fields.ArrayField(new fields.StringField());

		schema.story = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
			max: 2
		});

		schema.spark = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
			max: 2
		});

		// Iterate over stat names and create a new SchemaField for each.
		schema.stats = new fields.SchemaField(
			Object.keys(CONFIG.GRIMWILD.stats).reduce((obj, stat) => {
				obj[stat] = new fields.SchemaField({
					value: new fields.NumberField({
						...requiredInteger,
						max: 4,
						initial: 1,
						min: 0
					}),
					marked: new fields.BooleanField()
				});
				return obj;
			}, {})
		);

		schema.thorns = new fields.NumberField({
			integer: true,
			min: 0
		});

		schema.features = new fields.StringField();
		schema.conditions = new fields.StringField();
		schema.backgrounds = new fields.SchemaField({
			name: new fields.StringField(),
			wises: new fields.ArrayField(new fields.StringField())
		});
		schema.traits = new fields.SchemaField({
			are: new fields.ArrayField(new fields.StringField()),
			not: new fields.StringField()
		})
		schema.desires = new fields.SchemaField({
			are: new fields.ArrayField(new fields.StringField()),
			not: new fields.StringField()
		})
		schema.bonds = new fields.SchemaField({
			name: new fields.StringField(),
			description: new fields.StringField()
		})

		return schema;
	}

	prepareDerivedData() {
		// Loop through stat scores, and add their modifiers to our sheet output.
		for (const key in this.stats) {
			// Handle stat label localization.
			this.stats[key].label =
				game.i18n.localize(CONFIG.GRIMWILD.stats[key]) ?? key;
			this.stats[key].abbr =
				game.i18n.localize(CONFIG.GRIMWILD.statAbbreviations[key]) ?? key;
		}
	}

	getRollData() {
		const data = this.toObject();

		// Copy the stat scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (this.stats) {
			for (let [k, v] of Object.entries(this.stats)) {
				data.stats[k] = v.value;
			}
		}

		data.lvl = this.attributes.level.value;

		return data;
	}

	async roll(options) {
		const rollData = this.getRollData();

		if (options?.stat && rollData?.stats?.[options.stat]) {
			const content = await renderTemplate("systems/grimwild/templates/dialog/stat-roll.hbs", {
				diceDefault: rollData?.stats?.[options.stat],
				thornsDefault: rollData?.thorns
			});
			const rollDialog = await foundry.applications.api.DialogV2.wait({
				window: { title: "Grimwild Roll" },
				content,
				modal: true,
				buttons: [
					{
						label: game.i18n.localize("GRIMWILD.Dialog.Roll"),
						action: "roll",
						callback: (event, button, dialog) => {
							return { dice: button.form.elements.dice.value, thorns: button.form.elements.thorns.value };
						}
					}
				]
			});
			rollData.thorns = rollDialog.thorns;
			rollData.statDice = rollDialog.dice;
			const formula = "{(@statDice)d6kh, (@thorns)d8}";
			const roll = new grimwild.roll(formula, rollData);

			await roll.toMessage({
				actor: this,
				speaker: ChatMessage.getSpeaker({ actor: this }),
				rollMode: game.settings.get("core", "rollMode")
			});
		}
	}
}
