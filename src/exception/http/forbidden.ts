import { HTTP_STATUS } from './enum.ts';

export class ForbiddenHttpException {
	public status = HTTP_STATUS.FORBIDDEN;
	public message = 'Forbidden';
}
