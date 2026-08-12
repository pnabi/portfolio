import { test, expect } from "@playwright/test"; //импорт 2х функций test и expect из внешней библиотеки по адресу @playwright/test

// E2E-уровень пирамиды: реальный браузер на живом стенде aiqa.su/pomidorqa.
//POMIDORQA_BASE_URL=http://localhost:3000 npx playwright test --project=e2e tests/e2e/booking-flow.spec.ts


test("основной путь: регистрация → навык → слот → поиск в каталоге → бронирование → «Мои встречи» у обоих", async ({
  browser,
}) => { //вызов функции test c названием теста и асинхронной функцией, которая принимает объект с браузером
  const runId = Date.now(); //объявление константы уникальный идентификатор прогона теста, основанный на текущем времени
  const skillTag = `Playwright-demo-${runId}`;//объявление константы уникальный тег навыка, основанный на текущем времени
  const host = { name: "Хост Автотест", email: `host-${runId}@example.com`, password: "testpass123" }; //Эта строка кода создает объект с учетными данными для первого пользователя — Хоста (организатора встреч или специалиста). Этот объект объединяет его имя, уникальный email и пароль
  const guest = { name: "Гость Автотест", email: `guest-${runId}@example.com`, password: "testpass123" }; //Эта строка кода создает объект с учетными данными для второго пользователя — Гостя (пользователя, который ищет хоста). Этот объект объединяет его имя, уникальный email и пароль

  // Два независимых аккаунта = два независимых браузерных контекста
  const hostContext = await browser.newContext(); //создание нового браузерного контекста для хоста
  const guestContext = await browser.newContext(); //создание нового браузерного контекста для гостя
  const hostPage = await hostContext.newPage(); //создание новой страницы в контексте хоста
  const guestPage = await guestContext.newPage(); //создание новой страницы в контексте гостя

  await test.step("Хост: регистрируется в PomidorQA", async () => { //создание шага теста с названием "Хост: регистрируется в PomidorQA" и асинхронной функцией, которая выполняет действия внутри этого шага
    await hostPage.goto("/pomidorqa/auth/register"); //переход на страницу регистрации хоста
    await hostPage.getByTestId("PomidorqaRegister-name-input").fill(host.name); //находит на экране вкладки Хоста поле для ввода имени и пишет туда: Хост Автотест
    await hostPage.getByTestId("PomidorqaRegister-email-input").fill(host.email); //находит поле ввода электронной почты на странице регистрации и вводит туда уникальный email Хоста
    await hostPage.getByTestId("PomidorqaRegister-password-input").fill(host.password); //находит поле ввода пароля на странице регистрации и вводит туда пароль Хоста: testpass123
    await hostPage.getByTestId("PomidorqaRegister-submit").click(); //находит кнопку отправки формы регистрации и кликает по ней
    await expect(hostPage).toHaveURL(/\/pomidorqa\/?$/); //ожидает, что после успешной регистрации Хост будет перенаправлен на главную страницу PomidorQA
  });

  await test.step('Хост: добавляет навык «могу помочь» в профиле', async () => { //создание шага теста с названием "Хост: добавляет навык «могу помочь» в профиле" и асинхронной функцией, которая выполняет действия внутри этого шага
    await hostPage.goto("/pomidorqa/profile"); //переход на страницу профиля Хоста
    await hostPage.getByTestId("PomidorqaProfile-add-skill-input").fill(skillTag); //находит поле ввода навыка на странице профиля и вводит туда уникальный тег навыка, созданный ранее
    await hostPage.getByTestId("PomidorqaProfile-add-skill-type-select").selectOption("can_help"); //находит выпадающий список типа навыка на странице профиля и выбирает опцию "can_help" (могу помочь)
    await hostPage.getByTestId("PomidorqaProfile-add-skill-submit").click(); //находит кнопку отправки формы добавления навыка на странице профиля и кликает по ней
    await expect(hostPage.getByTestId("PomidorqaProfile-can-help-skills")).toContainText(skillTag); //ожидает, что после добавления навыка на странице профиля Хоста появится текст с уникальным тегом навыка
  });

  await test.step("Хост: добавляет свободный слот на завтра", async () => { //создание шага теста с названием "Хост: добавляет свободный слот на завтра" и асинхронной функцией, которая выполняет действия внутри этого шага
    await hostPage.goto("/pomidorqa/profile/slots"); //переход на страницу управления слотами Хоста
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000); //создание объекта даты, представляющего завтрашний день, путем добавления 24 часов (в миллисекундах) к текущей дате и времени
    const date = tomorrow.toISOString().slice(0, 10); //форматирует полученную завтрашнюю дату в строку вида "YYYY-MM-DD" с помощью метода toISOString() и обрезание лишней части строки с помощью slice(0, 10)
    await hostPage.getByTestId("PomidorqaSlots-date-input").fill(date); //находит поле ввода даты на странице управления слотами и вводит туда завтрашнюю дату в формате "YYYY-MM-DD"
    await hostPage.getByTestId("PomidorqaSlots-time-input").fill("12:00"); //находит поле ввода времени на странице управления слотами и вводит туда время "12:00"
    await hostPage.getByTestId("PomidorqaSlots-add-submit").click(); //находит кнопку отправки формы добавления слота на странице управления слотами и кликает по ней
    await expect(hostPage.getByTestId("PomidorqaSlots-card").first()).toBeVisible(); //ожидает, что после добавления слота на странице управления слотами появится карточка с информацией о добавленном слоте
  });

  await test.step("Гость: регистрируется отдельным аккаунтом", async () => { //создание шага теста с названием "Гость: регистрируется отдельным аккаунтом" и асинхронной функцией, которая выполняет действия внутри этого шага
    await guestPage.goto("/pomidorqa/auth/register"); //переход на страницу регистрации Гостя
    await guestPage.getByTestId("PomidorqaRegister-name-input").fill(guest.name); //находит на экране вкладки Гостя поле для ввода имени и пишет туда: Гость Автотест
    await guestPage.getByTestId("PomidorqaRegister-email-input").fill(guest.email); //находит поле ввода электронной почты на странице регистрации и вводит туда уникальный email Гостя
    await guestPage.getByTestId("PomidorqaRegister-password-input").fill(guest.password); //находит поле ввода пароля на странице регистрации и вводит туда пароль Гостя: testpass123
    await guestPage.getByTestId("PomidorqaRegister-submit").click(); //находит кнопку отправки формы регистрации и кликает по ней
    await expect(guestPage).toHaveURL(/\/pomidorqa\/?$/); //ожидает, что после успешной регистрации Гость будет перенаправлен на главную страницу PomidorQA
  });

  await test.step("Гость: ищет хоста в каталоге по навыку (сценарий 9)", async () => { //создание шага теста с названием "Гость: ищет хоста в каталоге по навыку (сценарий 9)" и асинхронной функцией, которая выполняет действия внутри этого шага
    await guestPage.getByTestId("PomidorqaCatalog-filter-input").fill(skillTag); //находит поле ввода фильтра навыков на странице каталога и вводит туда уникальный тег навыка, созданный ранее
    await guestPage.getByTestId("PomidorqaCatalog-filter-submit").click(); //находит кнопку отправки формы фильтрации на странице каталога и кликает по ней
    await expect(
      guestPage.getByTestId("PomidorqaCatalog-card").filter({ hasText: host.name })
    ).toBeVisible(); //ожидает, что после фильтрации на странице каталога появится карточка с информацией о Хосте, содержащая его имя
  });

  await test.step("Гость: открывает карточку хоста", async () => { //создание шага теста с названием "Гость: открывает карточку хоста" и асинхронной функцией, которая выполняет действия внутри этого шага
    await guestPage.getByTestId("PomidorqaCatalog-card").filter({ hasText: host.name }).click(); //находит карточку Хоста на странице каталога, содержащую его имя, и кликает по ней
    await expect(guestPage.getByTestId("PomidorqaPerson-name")).toHaveText(host.name); //ожидает, что после открытия карточки Хоста на странице появится элемент с его именем
  });

  await test.step("Гость: кликает по дню и времени в календаре слотов", async () => { //создание шага теста с названием "Гость: кликает по дню и времени в календаре слотов" и асинхронной функцией, которая выполняет действия внутри этого шага
    await expect(async () => { //строка кода начинает асинхронную проверку с автоматическими повторами
      const dayChip = guestPage.getByTestId("BookingCalendar-day").first(); //находит первый элемент с тестовым идентификатором "BookingCalendar-day" на странице Гостя и сохраняет его в переменную dayChip
      if (!(await dayChip.isVisible().catch(() => false))) { //проверяет, видна ли кнопка дня в календаре (dayChip) на экране, и если элемент еще не успел загрузиться или вызвал ошибку, код безопасно возвращает false
        await guestPage.reload(); //перезагружает страницу Гостя, чтобы повторно попытаться найти элемент dayChip
      }
      await expect(dayChip).toBeVisible(); //ожидает, что элемент dayChip станет видимым на странице Гостя
    }).toPass({ timeout: 10_000 }); //ожидает, что асинхронная проверка завершится успешно в течение 10 секунд, иначе тест завершится с ошибкой

    await guestPage.getByTestId("BookingCalendar-day").first().click(); //находит первый элемент с тестовым идентификатором "BookingCalendar-day" на странице Гостя и кликает по нему
    await guestPage.getByTestId("BookingCalendar-time").first().click(); //находит первый элемент с тестовым идентификатором "BookingCalendar-time" на странице Гостя и кликает по нему
    await expect(guestPage.getByTestId("BookingConfirmModal-dialog")).toBeVisible(); //ожидает, что после клика по дню и времени в календаре слотов на странице Гостя появится модальное окно подтверждения бронирования
  });

  await test.step("Гость: подтверждает бронирование в модалке", async () => { //создание шага теста с названием "Гость: подтверждает бронирование в модалке" и асинхронной функцией, которая выполняет действия внутри этого шага
    await guestPage.getByTestId("BookingConfirmModal-confirm").click(); //находит кнопку подтверждения бронирования в модальном окне на странице Гостя и кликает по ней
    const success = guestPage.getByTestId("BookingConfirmModal-success"); //находит элемент с тестовым идентификатором "BookingConfirmModal-success" на странице Гостя и сохраняет его в переменную success
    const error = guestPage.getByTestId("BookingConfirmModal-error"); //находит элемент с тестовым идентификатором "BookingConfirmModal-error" на странице Гостя и сохраняет его в переменную error
    await expect(success.or(error)).toBeVisible({ timeout: 15_000 }); //ожидает, что либо элемент success, либо элемент error станет видимым на странице Гостя в течение 15 секунд
    if (await error.isVisible().catch(() => false)) { //проверяет, виден ли элемент error на странице Гостя, и если элемент еще не успел загрузиться или вызвал ошибку, код безопасно возвращает false
      throw new Error(`Бронирование не удалось: ${await error.textContent()}`); //если элемент error виден, выбрасывает ошибку с сообщением о том, что бронирование не удалось, и добавляет текстовое содержимое элемента error к сообщению об ошибке
    }
  });

  await test.step("Гость: видит бронирование в разделе «Мои встречи»", async () => { //создание шага теста с названием "Гость: видит бронирование в разделе «Мои встречи»" и асинхронной функцией, которая выполняет действия внутри этого шага
    await expect(async () => { //строка кода начинает асинхронную проверку с автоматическими повторами
      await guestPage.goto("/pomidorqa/bookings"); //переход на страницу «Мои встречи» Гостя
      const card = guestPage // объявление новой константы с именем card
        .getByTestId("PomidorqaBookings-upcoming-section") //находит на странице Гостя элемент с тестовым идентификатором "PomidorqaBookings-upcoming-section"
        .getByTestId("PomidorqaBookings-card-name"); //находит внутри найденного элемента элемент с тестовым идентификатором "PomidorqaBookings-card-name" и сохраняет его в переменную card
      await expect(card).toHaveText(host.name); //ожидает, что текст внутри элемента card будет совпадать с именем Хоста
    }).toPass({ timeout: 10_000 }); //ожидает, что асинхронная проверка завершится успешно в течение 10 секунд, иначе тест завершится с ошибкой
  });

  await test.step("Хост: тоже видит это бронирование в своих «Мои встречи»", async () => { //создание шага теста с названием "Хост: тоже видит это бронирование в своих «Мои встречи»" и асинхронной функцией, которая выполняет действия внутри этого шага
    await expect(async () => { //строка кода начинает асинхронную проверку с автоматическими повторами
      await hostPage.goto("/pomidorqa/bookings"); //переход на страницу «Мои встречи» Хоста
      const card = hostPage // объявление новой константы с именем card
        .getByTestId("PomidorqaBookings-upcoming-section") //находит на странице Хоста элемент с тестовым идентификатором "PomidorqaBookings-upcoming-section"
        .getByTestId("PomidorqaBookings-card-name"); //находит внутри найденного элемента элемент с тестовым идентификатором "PomidorqaBookings-card-name" и сохраняет его в переменную card
      await expect(card).toHaveText(guest.name); //ожидает, что текст внутри элемента card будет совпадать с именем Гостя
    }).toPass({ timeout: 10_000 }); //ожидает, что асинхронная проверка завершится успешно в течение 10 секунд, иначе тест завершится с ошибкой
  });

  await hostContext.close(); //закрытие браузерного контекста Хоста после завершения теста
  await guestContext.close(); //закрытие браузерного контекста Гостя после завершения теста
});