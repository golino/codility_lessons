using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TapeEquilibrium
{
	class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine("O Resultedo é: {0}", solution(new int[] { 3, 1, 2, 4, 3 }));
			Console.ReadLine();
		}
		public static int solution(int[] A)
		{
			int dif = Int32.MaxValue;
			List<int[]> list = new List<int[]>();

			if (A.Length < 2 || A.Length > 100000)
				return 0;

			int soma = 0, soma2 = 0;

			for (int i = 0; i < A.Length; i++)
			{
				soma += A[i];
			}

			for (int P = 1; P < A.Length; P++)
			{
				soma2 += A[P - 1];
				list.Add(new int[] { soma2, soma - soma2 });
			}

			foreach (int[] item in list)
			{
				if (Math.Abs(item[0] - item[1]) < dif)
					dif = (int)Math.Abs(item[0] - item[1]);
			}

			return dif;
		}
	}
}
