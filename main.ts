import fs from "fs";
import { parse } from "csv";
import { generate } from "generate-password-browser";
import { error } from "console";

const requestUrl = 'http://localhost:3000/grader/api/users';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNzYxMzdmNi1iMDdhLTQ1NDEtYWJjYS00YWZhNDc2NDI0OTEiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sImlhdCI6MTcxODM4MzYwOSwiZXhwIjoxNzE4OTg4NDA5fQ.uRTVShUPTT3678aVNasmqNZhOPO2BnkFZyIsq0cKaB8';
const passwordLength = 16;

type StudentRecord = {
  rowNumber: string;
  ID: string;
  sector: string;
  prefix_th: string;
  firstName_th: string;
  lastName_th: string;
  fullName_th: string;
  nickName_th: string;
  firstName_en: string;
  lastName_en: string;
  fullName_en: string;
  nickName_en: string;
  email_personal: string;
  email_university: string;
  phoneNumber: string;
  instagram: string;
  lineID: string;
  discordUsernameFromUser: string;
  discordID: string;
  positions: string;
};

type Role = "Admin" | "User" | "Staff" | "Reviewer" | "Admin" | "SuperAdmin";

interface CreateUserDto {
  displayName: string;
  email: string;
  roles: Role[];
  group?: string;
  password?: string;
}

const processFile = async () => {
  const records: StudentRecord[] = [];
  const parser = fs.createReadStream("./student-list.csv").pipe(
    parse({
      columns: true,
    })
  );
  for await (const record of parser) {
    records.push(record);
  }
  return records;
};

(async () => {
  const records = await processFile();

  const createUserDtos: CreateUserDto[] = records.map((record) => {
    const password = generate({
      length: passwordLength,
      numbers: true,
      symbols: true,
      lowercase: true,
      uppercase: true,
      strict: true,
      exclude: '()+_-=}{[]|:;"/?.><,`~',
    });
    const createUserDto: CreateUserDto = {
      displayName: record.nickName_en,
      email: record.email_university,
      roles: ["Staff"],
      password: password,
    };
    return createUserDto;
  });

  const credentials = createUserDtos.map((dto) => {
    return `${dto.email}:${dto.password}\n`;
  });
  fs.writeFile("credentials.txt", credentials.join(""), (err) => {
    if (err) throw err;
  });

  createUserDtos.forEach(async (dto) => {
    console.log(dto);
    fetch(requestUrl, {
      method: "POST",
      body: JSON.stringify(dto),
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (response) => console.log(await response.json()))
      .catch((error) => console.error(error));
  });
  // console.info(records);
})();
