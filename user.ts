import fs from "fs";
import { parse } from "csv";
import { error } from "console";
const requestUrl = 'http://localhost:3000/grader/api/users';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNzYxMzdmNi1iMDdhLTQ1NDEtYWJjYS00YWZhNDc2NDI0OTEiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sImlhdCI6MTcxODM4MzYwOSwiZXhwIjoxNzE4OTg4NDA5fQ.uRTVShUPTT3678aVNasmqNZhOPO2BnkFZyIsq0cKaB8';
const passwordLength = 16;

type StudentRecord = {
  email: string;
  nick: string;
  nickPrefix: string;
  group: string;
  groupId: string;
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
  const parser = fs.createReadStream("./user-list.csv").pipe(
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
    const createUserDto: CreateUserDto = {
      displayName: record.nickPrefix,
      email: record.email,
      roles: ["User"],
      group: record.groupId
    };
    return createUserDto;
  });

  // const credentials = createUserDtos.map((dto) => {
  //   return `${dto.email}:${dto.password}\n`;
  // });
  // fs.writeFile("credentials.txt", credentials.join(""), (err) => {
  //   if (err) throw err;
  // });

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
