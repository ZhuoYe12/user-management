const config = require('config.json');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    try {
        // Use DATABASE_URL from environment if available, otherwise use individual config
        const dbUrl = process.env.DATABASE_URL;
        
        let sequelize;
        if (dbUrl) {
            // Use connection URL if available
            sequelize = new Sequelize(dbUrl, {
                dialect: 'postgres',
                logging: console.log,
                define: {
                    timestamps: false
                },
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                retry: {
                    max: 3,
                    match: [
                        /SequelizeConnectionError/,
                        /SequelizeConnectionRefusedError/,
                        /SequelizeHostNotFoundError/,
                        /SequelizeHostNotReachableError/,
                        /SequelizeInvalidConnectionError/,
                        /SequelizeConnectionTimedOutError/,
                        /TimeoutError/
                    ]
                }
            });
        } else {
            // Fallback to individual config
            const { host, port, user, password, database } = config.database;
            console.log(`Connecting to database: ${database} on ${host}:${port}`);
            
            const dbConfig = {
                host: process.env.PGHOST || host,
                port: parseInt(process.env.PGPORT || port, 10),
                user: process.env.PGUSER || user,
                password: process.env.PGPASSWORD || password,
                database: process.env.PGDATABASE || database
            };

            // Validate port number
            if (isNaN(dbConfig.port) || dbConfig.port < 0 || dbConfig.port > 65535) {
                throw new Error(`Invalid port number: ${dbConfig.port}`);
            }
            
            sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, { 
                host: dbConfig.host, 
                port: dbConfig.port, 
                dialect: 'postgres',
                logging: console.log,
                define: {
                    timestamps: false
                },
                dialectOptions: {
                    ssl: process.env.NODE_ENV === 'production' ? {
                        require: true,
                        rejectUnauthorized: false
                    } : false
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                retry: {
                    max: 3,
                    match: [
                        /SequelizeConnectionError/,
                        /SequelizeConnectionRefusedError/,
                        /SequelizeHostNotFoundError/,
                        /SequelizeHostNotReachableError/,
                        /SequelizeInvalidConnectionError/,
                        /SequelizeConnectionTimedOutError/,
                        /TimeoutError/
                    ]
                }
            });
        }

        // Test the connection
        try {
            await sequelize.authenticate();
            console.log('Database connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }

        // init models and add them to the exported db object
        console.log('Initializing models...');
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
        db.Department = require('../departments/department.model')(sequelize);
        db.Employee = require('../employees/employee.model')(sequelize);
        db.Workflow = require('../workflows/workflow.model')(sequelize);
        db.Request = require('../requests/request.model')(sequelize);
        db.RequestItem = require('../requests/request-item.model')(sequelize);

        // define relationships
        console.log('Setting up model relationships...');

        // Account - RefreshToken relationship
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        // Department - Employee relationship
        db.Department.hasMany(db.Employee, { 
            foreignKey: 'departmentId',
            onDelete: 'SET NULL'
        });
        db.Employee.belongsTo(db.Department, { 
            foreignKey: 'departmentId'
        });

        // Account - Employee relationship  
        db.Account.hasOne(db.Employee, { 
            foreignKey: 'userId', 
            onDelete: 'CASCADE'
        });
        db.Employee.belongsTo(db.Account, { 
            foreignKey: 'userId'
        });

        // Employee - Workflow relationship
        db.Employee.hasMany(db.Workflow, {
            foreignKey: 'employeeId',
            onDelete: 'CASCADE'
        });
        db.Workflow.belongsTo(db.Employee, {
            foreignKey: 'employeeId'
        });

        // Request relationships
        db.Employee.hasMany(db.Request, {
            foreignKey: 'employeeId',
            onDelete: 'CASCADE'
        });
        db.Request.belongsTo(db.Employee, {
            foreignKey: 'employeeId'
        });

        // Request-Items relationship
        db.Request.hasMany(db.RequestItem, {
            foreignKey: 'requestId',
            onDelete: 'CASCADE'
        });
        db.RequestItem.belongsTo(db.Request, {
            foreignKey: 'requestId'
        });

        // Request-Approver relationship
        db.Account.hasMany(db.Request, {
            foreignKey: 'approverId',
            as: 'ApprovedRequests',
            onDelete: 'SET NULL'
        });
        db.Request.belongsTo(db.Account, {
            foreignKey: 'approverId',
            as: 'Approver'
        });

        // sync all models with database
        console.log('Syncing models with database...');
        
        // Use force: false to avoid dropping tables
        // Use alter: true to update existing tables
        await sequelize.sync({ force: false, alter: true });
        console.log('Database sync complete');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}
