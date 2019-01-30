cc.Class({
	extends: cc.Component,

	properties: {},

	onLoad() {
		this._armatureDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
		this._armature = this._armatureDisplay.armature();
		this.slots = this._armature.getSlots().filter(slot => {
			return !!slot.boundingBoxData;
		});
		this.colliders = {};
	},

	start() {},

	update(dt) {
		this.updateColliders(this.slots, this.colliders);
	},
	updateColliders(slots, colliders) {
		slots.map(slot => {
			let [slotName, collider, node] = [slot.name, ,];
			if (colliders[slotName]) {
				collider = colliders[slotName];
				node = collider.node;
				node.parent = this.node;
				node.active && (node.active = false);
			} else {
				node = new cc.Node(slotName);
				node.groupIndex = this.node.groupIndex;
				colliders[slotName] = collider = node.addComponent(cc.PolygonCollider);
			}

			let currentBone = slot.parent;
			let transform = currentBone.global;
			!node.active && (node.active = true);
			node.x = transform.x;
			node.y = -transform.y;

			let rotation = 0;
			let scaleX = 1;
			let scaleY = 1;
			while (currentBone) {
				rotation += (currentBone.global.rotation * 180) / Math.PI;
				scaleX *= currentBone.global.scaleX;
				scaleY *= currentBone.global.scaleY;
				currentBone = currentBone.parent;
			}
			node.rotation = rotation;
			node.scaleX = scaleX;
			node.scaleY = scaleY;

			while (collider.points.length > slot.boundingBoxData.vertices.length / 2)
				collider.points.pop();

			for (let i = 0; i < slot.boundingBoxData.vertices.length / 2; ++i) {
				collider.points[i] = cc.v2(
					slot.boundingBoxData.vertices[i * 2] + slot.origin.x,
					-(slot.boundingBoxData.vertices[i * 2 + 1] + slot.origin.y)
				);
			}
		});
	}
});
