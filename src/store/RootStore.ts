import { AuthStore } from './modules/AuthStore';
import { OrganizationStore } from './modules/OrganizationStore';
import { MembershipStore } from './modules/MembershipStore';
import { TeamStore } from './modules/TeamStore';
import { ProjectStore } from './modules/ProjectStore';
import { TaskStore } from './modules/TaskStore';

export class RootStore {
	authStore: AuthStore;
	organizationStore: OrganizationStore;
	membershipStore: MembershipStore;
	teamStore: TeamStore;
	projectStore: ProjectStore;
	taskStore: TaskStore;

	constructor() {
		this.authStore = new AuthStore(this);
		this.organizationStore = new OrganizationStore(this);
		this.membershipStore = new MembershipStore(this);
		this.teamStore = new TeamStore(this);
		this.projectStore = new ProjectStore(this);
		this.taskStore = new TaskStore(this);
	}
}

export const rootStore = new RootStore();
