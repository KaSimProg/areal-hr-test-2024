exports.up = (pgm) => {
    pgm.createTable('departments', {
      departments_id: { type: 'serial', primaryKey: true },
      organization_id: {
        type: 'integer',
        notNull: false,
        references: 'organizations(id)',
        onDelete: 'cascade',
      },
      name: { type: 'varchar(255)', notNull: true },
      parent_id: {
        type: 'integer',
        references: 'departments(id)',
        onDelete: 'cascade',
      },
      comment: { type: 'text', notNull: true },
    })
    pgm.sql(`
        INSERT INTO departments (name, organisation_id, parent_id, comment) VALUES
          ('HR', 1, 'null', Отедел разработки),
          ('IT', 2, '1', Отдел тестирования);
      `)
  }
  
  exports.down = (pgm) => {
    pgm.dropTable('departments')
  }
  