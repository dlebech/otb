import log from 'loglevel';

log.setLevel((process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO') as log.LogLevelDesc);

export default log;
