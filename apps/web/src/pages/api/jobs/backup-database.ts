import prisma from '../../../lib/prismadb';
import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';

const dbName = 'defaultdb';
const bucketName = 'diversified-db-backups';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

BigInt.prototype.toJSON = function () {
	return this.toString();
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class DatabaseBackupHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async backup(): Promise<{ ok: 1; result: unknown }> {
		const dateString = new Date().toISOString().replace(/:/g, '_');
		const checkpointName = `${dbName}_backup_${dateString}`;
		const result = await prisma.$queryRawUnsafe(`
			BACKUP DATABASE defaultdb
			INTO 's3://${bucketName}/${checkpointName}?AWS_ACCESS_KEY_ID=${process.env.BACKUP_USER_AWS_ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY=${process.env.BACKUP_USER_AWS_SECRET_ACCESS_KEY}'
			AS OF SYSTEM TIME '-10s';
		`);
		return { ok: 1, result };
	}
}

export default createHandler(DatabaseBackupHandler);
