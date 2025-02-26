describe('TableComponent E2E Tests', () => {
  const mockData = [
    { Items: [{ Id: 1, FirstName: 'John', SecondName: 'Doe' }, { Id: 2, FirstName: 'Jane', SecondName: 'Smith' }] },
    { Items: [{ Id: 1, Title: 'Math' }, { Id: 2, Title: 'Science' }] },
    { Items: [{ Id: 1, SchoolboyId: 1, ColumnId: 1, Title: 'Н' }] },
  ];

  beforeEach(() => {
    // Intercept only necessary requests
    cy.intercept('GET', '/v1/2/Column', { delay: 1000, body: mockData[1] }).as('getColumns');
    cy.intercept('GET', '/v1/2/Schoolboy', { delay: 1000, body: mockData[0] }).as('getSchoolboys');
    cy.intercept('GET', '/v1/2/Rate', { delay: 1000, body: mockData[2] }).as('getRates');

    cy.intercept('POST', '/v1/2/UnRate', {
      statusCode: 200,
      body: {},
    }).as('postUnRate');
    cy.visit('/');
    cy.wait('@getColumns');
    cy.wait('@getSchoolboys');
    cy.wait('@getRates');
  });

  it('should display the table with correct data', () => {
    cy.get('table').should('exist');
    cy.get('table').then((table) => {
      console.log(table.text());  // This will log the table content
    });
    cy.contains('Учнi').should('be.visible');
    cy.contains('Doe John').should('be.visible');
    cy.contains('Smith Jane').should('be.visible');
    cy.contains('Math').should('be.visible');
    cy.contains('Science').should('be.visible');
  });

  it('should navigate to card view when clicking on a student name', () => {
    cy.contains('Doe John').click();
    cy.url().should('include', '/card');
  });

  it('should handle pagination correctly', () => {
    const manyStudents = {
      Items: Array.from({ length: 10 }, (_, i) => ({
        Id: i + 1,
        FirstName: `Student${i + 1}`,
        SecondName: `Last${i + 1}`,
      })),
    };

    cy.intercept('GET', '/v1/2/Schoolboy*', {
      statusCode: 200,
      body: manyStudents,
    }).as('getManyStudents');

    cy.reload();

    cy.wait('@getManyStudents').then((interception) => {
      console.log(interception);
    });

    cy.contains('Last1 Student1').should('be.visible');
    cy.get('[aria-label="Go to next page"]').click();
    cy.contains('Last6 Student6').should('be.visible');
  });

  it('should handle lesson toggle correctly', () => {
    cy.get('table').should('exist');
    cy.get('tbody tr').first().find('td').eq(2).click();
    cy.get('tbody tr').first().find('td').eq(2).should('not.have.text', '');
  });

  it('should display loading message when data is being fetched', () => {
    cy.intercept('GET', '/v1/2/Schoolboys', { delay: 1000, body: mockData[0] }).as('getSchoolboys');
    cy.intercept('GET', '/v1/2/Columns', { delay: 1000, body: mockData[1] }).as('getColumns');
    cy.intercept('GET', '/v1/2/Rates', { delay: 1000, body: mockData[2] }).as('getRates');

    cy.reload();
    cy.contains('Loading...').should('be.visible');
    cy.wait(['@getSchoolboys', '@getColumns', '@getRates']);
  });

  // it('should display error message when data fetch fails', () => {
  //   // Перехватываем запросы и заставляем их возвращать ошибку 500
  //   cy.intercept('GET', '/v1/2/Schoolboy*', { statusCode: 500, body: {} }).as('getSchoolboysError');
  //   cy.intercept('GET', '/v1/2/Column*', { statusCode: 500, body: {} }).as('getColumnsError');
  //   cy.intercept('GET', '/v1/2/Rate*', { statusCode: 500, body: {} }).as('getRatesError');
  //
  //   cy.reload();
  //
  //   cy.wait('@getSchoolboysError');
  //   cy.wait('@getColumnsError');
  //   cy.wait('@getRatesError');
  //
  //   cy.contains('Error: occurred').should('be.visible');
  // });
});
