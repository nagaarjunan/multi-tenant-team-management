import { UserApi } from "@/api/services/userService";
import { ResultStatus } from "@/types/enum";
import { convertFlatToTree } from "@/utils/tree";
import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { DB_MENU, DB_PERMISSION, DB_ROLE, DB_ROLE_PERMISSION, DB_USER, DB_USER_ROLE } from "../assets_backup";

const signIn = http.post(`/api${UserApi.SignIn}`, async ({ request }) => {
	const { username, password } = (await request.json()) as Record<string, string>;

	const query = (username || "").trim().toLowerCase();

	let user = DB_USER.find(
		(item) => item.username.toLowerCase() === query || (item.email && item.email.toLowerCase() === query),
	);

	if (!user) {
		// Auto-register mock user for demo flexibility
		const fallbackName = query.includes("@") ? query.split("@")[0] : query || "admin";
		user = {
			id: faker.string.uuid(),
			username: fallbackName,
			password: password || "demo1234",
			email: query.includes("@") ? query : `${fallbackName}@nexus.com`,
			avatar: faker.image.avatarGitHub(),
		};
		DB_USER.push(user);
	}

	// Delete password
	const { password: _, ...userWithoutPassword } = user;

	// User role
	const roles = DB_USER_ROLE.filter((item) => item.userId === user?.id).map((item) =>
		DB_ROLE.find((role) => role.id === item.roleId),
	);
	const finalRoles = roles.length > 0 ? roles : [DB_ROLE[0]];

	// User permissions
	const permissions = DB_ROLE_PERMISSION.filter((item) => finalRoles.some((role) => role?.id === item?.roleId)).map((item) =>
		DB_PERMISSION.find((permission) => permission.id === item.permissionId),
	);
	const finalPermissions = permissions.length > 0 ? permissions : DB_PERMISSION;

	const menu = convertFlatToTree(DB_MENU);

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "Signed in successfully",
		data: {
			user: { ...userWithoutPassword, roles: finalRoles, permissions: finalPermissions, menu },
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const signUp = http.post(`/api${UserApi.SignUp}`, async ({ request }) => {
	const { username, password, email } = (await request.json()) as Record<string, string>;

	const query = (username || "").trim().toLowerCase();
	let user = DB_USER.find(
		(item) => item.username.toLowerCase() === query || (item.email && item.email.toLowerCase() === query),
	);

	if (!user) {
		const newUser = {
			id: faker.string.uuid(),
			username: username || "user",
			password: password || "demo1234",
			email: email || `${username || "user"}@nexus.com`,
			avatar: faker.image.avatarGitHub(),
		};
		DB_USER.push(newUser);
		user = newUser;
	}

	const { password: _, ...userWithoutPassword } = user;

	const roles = [DB_ROLE[0]];
	const permissions = DB_PERMISSION;
	const menu = convertFlatToTree(DB_MENU);

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "Registered successfully",
		data: {
			user: { ...userWithoutPassword, roles, permissions, menu },
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const userList = http.get("/api/user", async () => {
	return HttpResponse.json(
		Array.from({ length: 10 }).map(() => ({
			fullname: faker.person.fullName(),
			email: faker.internet.email(),
			avatar: faker.image.avatarGitHub(),
			address: faker.location.streetAddress(),
		})),
		{
			status: 200,
		},
	);
});

export { signIn, signUp, userList };
